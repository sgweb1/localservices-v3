<?php

namespace App\Services\Notifications;

use App\Models\User;
use App\Models\NotificationTemplate;
use App\Mail\GenericNotificationMail;
use App\Events\NotificationToastEvent;
use App\Services\Notifications\WebPushClient;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class ChannelDispatcher
{
    public function __construct(
        protected VariableInterpolator $interpolator,
        protected WebPushClient $webPushClient,
    ) {}

    public function dispatchEmail(User $user, NotificationTemplate $template, array $variables): bool
    {
        if (!$template->email_enabled) {
            return false;
        }

        try {
            $subject = $this->interpolator->interpolate($template->email_subject, $variables);
            $body = $this->interpolator->interpolate($template->email_body, $variables);
            $actionUrl = $this->interpolator->interpolate($template->email_action_url ?? '', $variables);
            Mail::to($user->email)->send(
                new GenericNotificationMail($subject, $body, $actionUrl ?: null)
            );

            return true;
        } catch (\Exception $e) {
            Log::error('Email dispatch failed', [
                'user_id' => $user->id,
                'template_id' => $template->id,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    public function dispatchToast(User $user, NotificationTemplate $template, array $variables): bool
    {
        if (!$template->toast_enabled) {
            return false;
        }

        try {
            $title = $this->interpolator->interpolate($template->toast_title ?? '', $variables);
            $message = $this->interpolator->interpolate($template->toast_message, $variables);
            $actionUrl = $this->interpolator->interpolate($template->toast_action_url ?? '', $variables);

            // Broadcast event to user's private channel
            event(new NotificationToastEvent(
                userId: $user->id,
                title: $title ?: null,
                message: $message,
                type: $template->toast_type ?? 'info',
                actionUrl: $actionUrl ?: null,
                metadata: $variables,
            ));

            return true;
        } catch (\Exception $e) {
            Log::error('Toast dispatch failed', [
                'user_id' => $user->id,
                'template_id' => $template->id,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    public function dispatchPush(User $user, NotificationTemplate $template, array $variables): bool
    {
        if (!$template->push_enabled) {
            return false;
        }

        try {
            $title = $this->interpolator->interpolate($template->push_title, $variables);
            $body = $this->interpolator->interpolate($template->push_body, $variables);
            $actionUrl = $this->interpolator->interpolate($template->push_action_url ?? '', $variables);
            $icon = $this->interpolator->interpolate($template->push_icon ?? '', $variables);

            $payload = [
                'title' => $title,
                'body' => $body,
                'icon' => $icon ?: '/icons/icon-192.png',
                'badge' => '/icons/badge-72.png',
                'data' => [
                    'url' => $actionUrl ?: null,
                    'event_key' => $template->event->key,
                ],
            ];

            $sentCount = $this->webPushClient->send($user, $payload);

            if ($sentCount === 0) {
                Log::warning('Web Push not sent (no active subscriptions)', [
                    'user_id' => $user->id,
                    'template_id' => $template->id,
                ]);
                return false;
            }

            return true;
        } catch (\Exception $e) {
            Log::error('Push dispatch failed', [
                'user_id' => $user->id,
                'template_id' => $template->id,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    public function dispatchDatabase(User $user, NotificationTemplate $template, array $variables): bool
    {
        if (!$template->database_enabled) {
            return false;
        }

        try {
            $title = $this->interpolator->interpolate($template->database_title ?? '', $variables);
            $message = $this->interpolator->interpolate($template->database_body ?? '', $variables);
            $actionUrl = $this->interpolator->interpolate($template->database_action_url ?? '', $variables);

            $user->notifications()->create([
                'type' => $template->event->key,
                'data' => [
                    'title' => $title ?: $template->event->name,
                    'message' => $message,
                    'action_url' => $actionUrl ?: null,
                    'variables' => $variables,
                ],
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error('Database notification failed', [
                'user_id' => $user->id,
                'template_id' => $template->id,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }
}