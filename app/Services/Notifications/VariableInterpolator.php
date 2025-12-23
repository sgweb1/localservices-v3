<?php

namespace App\Services\Notifications;

class VariableInterpolator
{
    /**
     * Replace {variable} placeholders in a template string with actual values.
     * Supports dot notation for nested arrays: {user.name}
     */
    public function interpolate(string $template, array $variables): string
    {
        return preg_replace_callback(
            '/\{([a-zA-Z0-9_.]+)\}/',
            function ($matches) use ($variables) {
                $key = $matches[1];
                $value = $this->getValue($key, $variables);
                return $value ?? $matches[0];
            },
            $template
        );
    }

    /**
     * Get value from variables array using dot notation.
     * Example: "user.name" will get $variables['user']['name']
     */
    private function getValue(string $key, array $variables): string|int|null
    {
        $keys = explode('.', $key);
        $value = $variables;

        foreach ($keys as $nestedKey) {
            if (is_array($value) && isset($value[$nestedKey])) {
                $value = $value[$nestedKey];
            } else {
                return null;
            }
        }

        if (is_scalar($value)) {
            return (string) $value;
        }

        return null;
    }
}
