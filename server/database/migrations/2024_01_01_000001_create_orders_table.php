<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateOrdersTable extends Migration
{
    public function up()
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('customer_name');
            $table->string('contact_phone', 50)->nullable();
            $table->string('address_line1')->nullable();
            $table->string('address_line2')->nullable();
            $table->text('special_notes')->nullable();
            $table->decimal('weight_kg', 6, 2)->default(0);
            $table->enum('service_type', ['wash-dry-fold', 'wash-dry-press', 'premium-care']);
            $table->date('scheduled_date')->nullable();
            $table->time('scheduled_time')->nullable();
            $table->enum('fulfillment_type', ['dropoff', 'delivery'])->default('dropoff');
            $table->enum('status', ['queue', 'washing', 'drying', 'ready', 'completed'])->default('queue');
            $table->decimal('total_fee', 10, 2)->default(0);
            $table->enum('payment_status', ['pending', 'paid'])->default('pending');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('orders');
    }
}
