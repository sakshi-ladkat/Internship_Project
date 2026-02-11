<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed continents and countries
        $this->call([
            ContinentSeeder::class,
            CountrySeeder::class,
        ]);

        $this->command->info('Database seeded successfully!');
    }
}
