<?php

namespace App\Filament\Resources;

use App\Models\Boost;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

/**
 * Filament Resource dla Boostów
 *
 * Zarządzanie boost'ami z Admin panelu:
 * - Przeglądanie listy boost'ów
 * - Filtrowanie po typie, mieście, statusie
 * - Sortowanie po dacie wygasania i cenie
 * - Edycja i usuwanie boost'ów
 */
class BoostResource extends Resource
{
    protected static ?string $model = Boost::class;

    protected static ?string $navigationLabel = 'Boost\'y';

    protected static ?string $pluralModelLabel = 'Boost\'y';

    protected static ?string $modelLabel = 'Boost';

    protected static ?int $navigationSort = 2;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Informacje boost\'u')
                    ->schema([
                        Forms\Components\Select::make('provider_id')
                            ->relationship('provider', 'name')
                            ->searchable()
                            ->preload()
                            ->required()
                            ->label('Provider'),

                        Forms\Components\Select::make('type')
                            ->options([
                                'city_boost' => 'City Boost',
                                'spotlight' => 'Spotlight',
                            ])
                            ->required()
                            ->label('Typ boost\'u'),

                        Forms\Components\TextInput::make('city')
                            ->maxLength(100)
                            ->nullable()
                            ->label('Miasto'),

                        Forms\Components\TextInput::make('category')
                            ->maxLength(100)
                            ->nullable()
                            ->label('Kategoria'),
                    ]),

                Forms\Components\Section::make('Szczegóły płatności')
                    ->schema([
                        Forms\Components\TextInput::make('price')
                            ->numeric()
                            ->prefix('PLN')
                            ->required()
                            ->label('Cena'),

                        Forms\Components\DateTimePicker::make('expires_at')
                            ->required()
                            ->label('Wygasa'),

                        Forms\Components\Toggle::make('is_active')
                            ->default(true)
                            ->label('Aktywny'),
                    ]),

                Forms\Components\Section::make('Powiązana faktura')
                    ->schema([
                        Forms\Components\Select::make('invoice_id')
                            ->relationship('invoice', 'id')
                            ->searchable()
                            ->nullable()
                            ->label('Faktura'),
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

                Tables\Columns\TextColumn::make('type')
                    ->badge()
                    ->formatStateUsing(fn (string $state): string => $state === 'city_boost' ? 'City' : 'Spotlight')
                    ->color(fn (string $state): string => $state === 'city_boost' ? 'info' : 'success')
                    ->label('Typ'),

                Tables\Columns\TextColumn::make('city')
                    ->searchable()
                    ->sortable()
                    ->label('Miasto'),

                Tables\Columns\TextColumn::make('category')
                    ->searchable()
                    ->sortable()
                    ->label('Kategoria'),

                Tables\Columns\TextColumn::make('expires_at')
                    ->dateTime()
                    ->sortable()
                    ->formatStateUsing(fn ($state) => $state ? $state->diffForHumans() : '-')
                    ->label('Wygasa'),

                Tables\Columns\TextColumn::make('price')
                    ->money('PLN')
                    ->sortable()
                    ->label('Cena'),

                Tables\Columns\BooleanColumn::make('is_active')
                    ->label('Aktywny'),

                Tables\Columns\TextColumn::make('invoice.status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'paid' => 'success',
                        'pending' => 'warning',
                        'failed' => 'danger',
                        'refunded' => 'gray',
                        default => 'secondary',
                    })
                    ->label('Status faktury'),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('type')
                    ->options([
                        'city_boost' => 'City Boost',
                        'spotlight' => 'Spotlight',
                    ])
                    ->label('Typ boost\'u'),

                Tables\Filters\SelectFilter::make('is_active')
                    ->options([
                        true => 'Aktywne',
                        false => 'Nieaktywne',
                    ])
                    ->label('Status'),

                Tables\Filters\DateRangeFilter::make('expires_at')
                    ->label('Data wygaśnięcia'),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                
                Tables\Actions\Action::make('renew')
                    ->label('Odnów')
                    ->icon('heroicon-m-arrow-path')
                    ->color('success')
                    ->visible(fn (\App\Models\Boost $record): bool => $record->is_active)
                    ->form([
                        Forms\Components\Select::make('days')
                            ->options([
                                7 => '7 dni',
                                14 => '14 dni',
                                30 => '30 dni',
                            ])
                            ->required()
                            ->label('Okres przedłużenia'),
                    ])
                    ->action(function (\App\Models\Boost $record, array $data) {
                        $record->update([
                            'expires_at' => now()->addDays($data['days']),
                        ]);
                        
                        \Filament\Notifications\Notification::make()
                            ->title('Boost odnowiony')
                            ->success()
                            ->send();
                    }),
                
                Tables\Actions\Action::make('cancel')
                    ->label('Anuluj')
                    ->icon('heroicon-m-x-mark')
                    ->color('danger')
                    ->visible(fn (\App\Models\Boost $record): bool => $record->is_active)
                    ->requiresConfirmation()
                    ->modalHeading('Anuluj boost')
                    ->modalDescription('Czy na pewno chcesz anulować ten boost? Akcja nie może być wycofana.')
                    ->action(function (\App\Models\Boost $record) {
                        $record->update([
                            'is_active' => false,
                        ]);
                        
                        \Filament\Notifications\Notification::make()
                            ->title('Boost anulowany')
                            ->success()
                            ->send();
                    }),
                
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ])
            ->defaultSort('expires_at', 'desc');
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => \App\Filament\Resources\BoostResource\Pages\ListBoosts::class,
            'create' => \App\Filament\Resources\BoostResource\Pages\CreateBoost::class,
            'edit' => \App\Filament\Resources\BoostResource\Pages\EditBoost::class,
        ];
    }
}
