<?php

namespace App\Filament\Resources;

use App\Models\PlatformInvoice;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

/**
 * Filament Resource dla Platform Invoices (Faktur)
 *
 * Zarządzanie fakturami i płatności Stripe:
 * - Przeglądanie wszystkich faktur
 * - Filtrowanie po statusie, dacie
 * - Przeglądanie szczegółów płatności Stripe
 * - Eksport faktur (opcjonalnie)
 */
class PlatformInvoiceResource extends Resource
{
    protected static ?string $model = PlatformInvoice::class;


    protected static ?string $navigationLabel = 'Faktury';

    protected static ?string $pluralModelLabel = 'Faktury';

    protected static ?string $modelLabel = 'Faktura';

    protected static ?int $navigationSort = 3;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Informacje faktury')
                    ->schema([
                        Forms\Components\Select::make('provider_id')
                            ->relationship('provider', 'name')
                            ->searchable()
                            ->preload()
                            ->required()
                            ->disabled()
                            ->label('Provider'),

                        Forms\Components\TextInput::make('amount')
                            ->numeric()
                            ->prefix('PLN')
                            ->required()
                            ->disabled()
                            ->label('Kwota'),

                        Forms\Components\TextInput::make('currency')
                            ->maxLength(3)
                            ->default('PLN')
                            ->disabled()
                            ->label('Waluta'),

                        Forms\Components\TextInput::make('description')
                            ->maxLength(255)
                            ->disabled()
                            ->label('Opis'),

                        Forms\Components\Select::make('status')
                            ->options([
                                'pending' => 'Oczekująca',
                                'paid' => 'Opłacona',
                                'failed' => 'Nie powiodła się',
                                'refunded' => 'Zwrócona',
                            ])
                            ->required()
                            ->label('Status'),
                    ]),

                Forms\Components\Section::make('Szczegóły Stripe')
                    ->schema([
                        Forms\Components\TextInput::make('stripe_session_id')
                            ->maxLength(255)
                            ->nullable()
                            ->disabled()
                            ->copyable()
                            ->label('Checkout Session ID'),

                        Forms\Components\TextInput::make('stripe_payment_intent_id')
                            ->maxLength(255)
                            ->nullable()
                            ->disabled()
                            ->copyable()
                            ->label('Payment Intent ID'),

                        Forms\Components\Textarea::make('payment_details')
                            ->nullable()
                            ->disabled()
                            ->columnSpanFull()
                            ->label('Szczegóły płatności (JSON)'),
                    ]),

                Forms\Components\Section::make('Powiązany Boost')
                    ->schema([
                        Forms\Components\Select::make('boost_id')
                            ->relationship('boost', 'id')
                            ->searchable()
                            ->nullable()
                            ->disabled()
                            ->label('Boost'),
                    ])
                    ->collapsed(),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('provider.name')
                    ->searchable()
                    ->sortable()
                    ->label('Provider'),

                Tables\Columns\TextColumn::make('amount')
                    ->money('PLN')
                    ->sortable()
                    ->label('Kwota'),

                Tables\Columns\TextColumn::make('status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'paid' => 'success',
                        'pending' => 'warning',
                        'failed' => 'danger',
                        'refunded' => 'gray',
                        default => 'secondary',
                    })
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'pending' => 'Oczekująca',
                        'paid' => 'Opłacona',
                        'failed' => 'Nie powiodła się',
                        'refunded' => 'Zwrócona',
                        default => $state,
                    })
                    ->label('Status'),

                Tables\Columns\TextColumn::make('stripe_session_id')
                    ->searchable()
                    ->copyable()
                    ->limit(20)
                    ->label('Session ID'),

                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->label('Data utworzenia'),

                Tables\Columns\TextColumn::make('boost.type')
                    ->badge()
                    ->formatStateUsing(fn (?string $state): string => $state ? ($state === 'city_boost' ? 'City' : 'Spotlight') : '-')
                    ->label('Typ boost\'u'),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options([
                        'pending' => 'Oczekująca',
                        'paid' => 'Opłacona',
                        'failed' => 'Nie powiodła się',
                        'refunded' => 'Zwrócona',
                    ])
                    ->label('Status'),

                Tables\Filters\DateRangeFilter::make('created_at')
                    ->label('Data utworzenia'),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
            ])
            ->bulkActions([
                // Bulk actions disabled for invoices
            ])
            ->defaultSort('created_at', 'desc');
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => \App\Filament\Resources\PlatformInvoiceResource\Pages\ListPlatformInvoices::class,
            'view' => \App\Filament\Resources\PlatformInvoiceResource\Pages\ViewPlatformInvoice::class,
        ];
    }
}
