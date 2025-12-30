<?php

namespace App\Filament\Resources;

use App\Models\Subscription;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

/**
 * Filament Resource dla Subskrypcji
 *
 * Zarządzanie subskrypcjami providera:
 * - Przeglądanie listy aktywnych i anulowanych subskrypcji
 * - Filtrowanie po statusie, okresie rozliczeniowym, planie
 * - Edycja szczegółów subskrypcji
 * - Anulowanie subskrypcji z powodem
 */
class SubscriptionResource extends Resource
{
    protected static ?string $model = Subscription::class;

    protected static ?string $navigationLabel = 'Subskrypcje';

    protected static ?string $pluralModelLabel = 'Subskrypcje';

    protected static ?string $modelLabel = 'Subskrypcja';

    protected static ?int $navigationSort = 4;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Informacje subskrypcji')
                    ->schema([
                        Forms\Components\Select::make('user_id')
                            ->relationship('user', 'name')
                            ->searchable()
                            ->preload()
                            ->required()
                            ->label('Provider'),

                        Forms\Components\Select::make('subscription_plan_id')
                            ->relationship('plan', 'name')
                            ->searchable()
                            ->preload()
                            ->required()
                            ->disabled()
                            ->label('Plan subskrypcji'),

                        Forms\Components\Select::make('billing_period')
                            ->options([
                                'monthly' => 'Miesiąc',
                                'yearly' => 'Rok',
                            ])
                            ->required()
                            ->label('Okres rozliczeniowy'),

                        Forms\Components\Select::make('status')
                            ->options([
                                'active' => 'Aktywna',
                                'cancelled' => 'Anulowana',
                                'expired' => 'Wygasła',
                                'paused' => 'Wznowiona',
                            ])
                            ->required()
                            ->label('Status'),
                    ]),

                Forms\Components\Section::make('Daty i period')
                    ->schema([
                        Forms\Components\DateTimePicker::make('started_at')
                            ->required()
                            ->disabled()
                            ->label('Data rozpoczęcia'),

                        Forms\Components\DateTimePicker::make('ends_at')
                            ->required()
                            ->label('Data wygaśnięcia'),

                        Forms\Components\DateTimePicker::make('renews_at')
                            ->nullable()
                            ->label('Data odnowienia'),

                        Forms\Components\DateTimePicker::make('cancelled_at')
                            ->nullable()
                            ->disabled()
                            ->label('Data anulowania'),

                        Forms\Components\DateTimePicker::make('paused_at')
                            ->nullable()
                            ->label('Data wznowienia'),
                    ]),

                Forms\Components\Section::make('Szczegóły anulowania')
                    ->schema([
                        Forms\Components\Textarea::make('cancellation_reason')
                            ->nullable()
                            ->columnSpanFull()
                            ->label('Powód anulowania'),
                    ])
                    ->collapsed(),

                Forms\Components\Section::make('Ustawienia')
                    ->schema([
                        Forms\Components\Toggle::make('auto_renew')
                            ->default(true)
                            ->label('Automatyczne odnowienie'),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('user.name')
                    ->searchable()
                    ->sortable()
                    ->label('Provider'),

                Tables\Columns\TextColumn::make('plan.name')
                    ->searchable()
                    ->sortable()
                    ->label('Plan'),

                Tables\Columns\TextColumn::make('billing_period')
                    ->badge()
                    ->formatStateUsing(fn (string $state): string => $state === 'monthly' ? 'Miesiąc' : 'Rok')
                    ->color(fn (string $state): string => $state === 'monthly' ? 'info' : 'success')
                    ->label('Okres'),

                Tables\Columns\TextColumn::make('status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'active' => 'success',
                        'cancelled' => 'danger',
                        'expired' => 'warning',
                        'paused' => 'gray',
                        default => 'secondary',
                    })
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'active' => 'Aktywna',
                        'cancelled' => 'Anulowana',
                        'expired' => 'Wygasła',
                        'paused' => 'Wznowiona',
                        default => $state,
                    })
                    ->label('Status'),

                Tables\Columns\TextColumn::make('ends_at')
                    ->dateTime()
                    ->sortable()
                    ->formatStateUsing(fn ($state) => $state ? $state->diffForHumans() : '-')
                    ->label('Wygasa'),

                Tables\Columns\TextColumn::make('started_at')
                    ->date()
                    ->sortable()
                    ->label('Rozpoczęta'),

                Tables\Columns\BooleanColumn::make('auto_renew')
                    ->label('Auto-odnowienie'),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options([
                        'active' => 'Aktywna',
                        'cancelled' => 'Anulowana',
                        'expired' => 'Wygasła',
                        'paused' => 'Wznowiona',
                    ])
                    ->label('Status'),

                Tables\Filters\SelectFilter::make('billing_period')
                    ->options([
                        'monthly' => 'Miesiąc',
                        'yearly' => 'Rok',
                    ])
                    ->label('Okres rozliczeniowy'),

                Tables\Filters\DateRangeFilter::make('ends_at')
                    ->label('Data wygaśnięcia'),

                Tables\Filters\TrashedFilter::make(),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                
                Tables\Actions\Action::make('renew')
                    ->label('Odnów')
                    ->icon('heroicon-m-arrow-path')
                    ->color('success')
                    ->visible(fn (\App\Models\Subscription $record): bool => $record->status === 'active')
                    ->form([
                        Forms\Components\Select::make('billing_period')
                            ->options([
                                'monthly' => 'Miesiąc',
                                'yearly' => 'Rok',
                            ])
                            ->label('Nowy okres rozliczeniowy'),
                    ])
                    ->action(function (\App\Models\Subscription $record, array $data) {
                        $period = $data['billing_period'] ?? $record->billing_period;
                        $days = $period === 'yearly' ? 365 : 30;
                        
                        $record->update([
                            'billing_period' => $period,
                            'ends_at' => now()->addDays($days),
                        ]);
                        
                        \Filament\Notifications\Notification::make()
                            ->title('Subskrypcja odnowiona')
                            ->success()
                            ->send();
                    }),
                
                Tables\Actions\Action::make('cancel')
                    ->label('Anuluj')
                    ->icon('heroicon-m-x-mark')
                    ->color('danger')
                    ->visible(fn (\App\Models\Subscription $record): bool => $record->status === 'active')
                    ->form([
                        Forms\Components\Textarea::make('cancellation_reason')
                            ->label('Powód anulowania')
                            ->placeholder('Podaj powód anulowania (opcjonalne)'),
                    ])
                    ->requiresConfirmation()
                    ->modalHeading('Anuluj subskrypcję')
                    ->modalDescription('Czy na pewno chcesz anulować tę subskrypcję?')
                    ->action(function (\App\Models\Subscription $record, array $data) {
                        $record->update([
                            'status' => 'cancelled',
                            'cancelled_at' => now(),
                            'cancellation_reason' => $data['cancellation_reason'] ?? null,
                        ]);
                        
                        \Filament\Notifications\Notification::make()
                            ->title('Subskrypcja anulowana')
                            ->success()
                            ->send();
                    }),
                
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                    Tables\Actions\RestoreBulkAction::make(),
                ]),
            ])
            ->defaultSort('ends_at', 'desc');
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => \App\Filament\Resources\SubscriptionResource\Pages\ListSubscriptions::class,
            'create' => \App\Filament\Resources\SubscriptionResource\Pages\CreateSubscription::class,
            'edit' => \App\Filament\Resources\SubscriptionResource\Pages\EditSubscription::class,
        ];
    }
}
