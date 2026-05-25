<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateInventoryTable extends Migration
{
    public function up()
    {
        Schema::create('inventory', function (Blueprint $table) {
            $table->id();
            $table->string('item_name', 100)->unique();
            $table->integer('current_level')->default(100);
            $table->integer('max_level')->default(100);
            $table->string('unit', 20)->default('units');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('inventory');
    }
}
