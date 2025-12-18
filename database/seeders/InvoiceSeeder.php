<?php

namespace Database\Seeders;

use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Payment;
use Illuminate\Database\Seeder;

/**
 * Seeder faktur
 */
class InvoiceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $completedPayments = Payment::where('status', 'completed')->get();
        $invoiceCounter = 1;

        foreach ($completedPayments as $payment) {
            $invoiceNumber = 'INV-' . date('Y') . '-' . str_pad($invoiceCounter, 5, '0', STR_PAD_LEFT);
            $invoiceCounter++;

            $subtotal = $payment->amount;
            $vatRate = 23.00;
            $vatAmount = $subtotal * ($vatRate / 100);
            $totalAmount = $subtotal + $vatAmount;

            $invoice = Invoice::create([
                'user_id' => $payment->user_id,
                'payment_id' => $payment->id,
                'invoice_number' => $invoiceNumber,
                'type' => $payment->payment_type === 'subscription' ? 'subscription' : 'service',
                'status' => $payment->status === 'completed' ? 'paid' : 'issued',
                'description' => $payment->payment_type === 'subscription'
                    ? 'Subskrypcja - ' . $payment->subscription?->plan->name
                    : 'Usługa - ' . $payment->booking?->service->name ?? 'Usługa',
                'subtotal' => $subtotal,
                'vat_rate' => $vatRate,
                'vat_amount' => $vatAmount,
                'total_amount' => $totalAmount,
                'currency' => 'PLN',
                'issued_at' => $payment->created_at,
                'due_at' => $payment->created_at->addDays(14),
                'paid_at' => $payment->status === 'completed' ? $payment->completed_at : null,
                'document_path' => 'invoices/' . $invoiceNumber . '.pdf',
            ]);

            // Dodaj pozycje na fakturze
            InvoiceItem::create([
                'invoice_id' => $invoice->id,
                'description' => $payment->reference,
                'quantity' => 1,
                'unit_price' => $subtotal,
                'total_price' => $subtotal,
                'metadata' => [
                    'payment_id' => $payment->id,
                    'payment_type' => $payment->payment_type,
                ],
            ]);
        }

        $this->command->info('Faktury: ' . Invoice::count() . ' utworzono');
    }
}
