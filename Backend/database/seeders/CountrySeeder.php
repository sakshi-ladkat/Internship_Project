<?php

namespace Database\Seeders;

use App\Models\Continent;
use App\Models\Country;
use Illuminate\Database\Seeder;

class CountrySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get continents
        $africa = Continent::where('code', 'AF')->first();
        $asia = Continent::where('code', 'AS')->first();
        $europe = Continent::where('code', 'EU')->first();
        $northAmerica = Continent::where('code', 'NA')->first();
        $southAmerica = Continent::where('code', 'SA')->first();
        $oceania = Continent::where('code', 'OC')->first();
        $antarctica = Continent::where('code', 'AN')->first();

        $countries = [
            // Africa
            ['continent_id' => $africa->id, 'name' => 'Egypt', 'code' => 'EGY', 'phone_code' => '+20'],
            ['continent_id' => $africa->id, 'name' => 'Nigeria', 'code' => 'NGA', 'phone_code' => '+234'],
            ['continent_id' => $africa->id, 'name' => 'South Africa', 'code' => 'ZAF', 'phone_code' => '+27'],
            ['continent_id' => $africa->id, 'name' => 'Kenya', 'code' => 'KEN', 'phone_code' => '+254'],
            ['continent_id' => $africa->id, 'name' => 'Morocco', 'code' => 'MAR', 'phone_code' => '+212'],
            ['continent_id' => $africa->id, 'name' => 'Ghana', 'code' => 'GHA', 'phone_code' => '+233'],
            ['continent_id' => $africa->id, 'name' => 'Ethiopia', 'code' => 'ETH', 'phone_code' => '+251'],

            // Asia
            ['continent_id' => $asia->id, 'name' => 'China', 'code' => 'CHN', 'phone_code' => '+86'],
            ['continent_id' => $asia->id, 'name' => 'India', 'code' => 'IND', 'phone_code' => '+91'],
            ['continent_id' => $asia->id, 'name' => 'Japan', 'code' => 'JPN', 'phone_code' => '+81'],
            ['continent_id' => $asia->id, 'name' => 'South Korea', 'code' => 'KOR', 'phone_code' => '+82'],
            ['continent_id' => $asia->id, 'name' => 'Singapore', 'code' => 'SGP', 'phone_code' => '+65'],
            ['continent_id' => $asia->id, 'name' => 'Thailand', 'code' => 'THA', 'phone_code' => '+66'],
            ['continent_id' => $asia->id, 'name' => 'Indonesia', 'code' => 'IDN', 'phone_code' => '+62'],
            ['continent_id' => $asia->id, 'name' => 'Malaysia', 'code' => 'MYS', 'phone_code' => '+60'],
            ['continent_id' => $asia->id, 'name' => 'Philippines', 'code' => 'PHL', 'phone_code' => '+63'],
            ['continent_id' => $asia->id, 'name' => 'Vietnam', 'code' => 'VNM', 'phone_code' => '+84'],
            ['continent_id' => $asia->id, 'name' => 'Pakistan', 'code' => 'PAK', 'phone_code' => '+92'],
            ['continent_id' => $asia->id, 'name' => 'Bangladesh', 'code' => 'BGD', 'phone_code' => '+880'],
            ['continent_id' => $asia->id, 'name' => 'Saudi Arabia', 'code' => 'SAU', 'phone_code' => '+966'],
            ['continent_id' => $asia->id, 'name' => 'United Arab Emirates', 'code' => 'ARE', 'phone_code' => '+971'],
            ['continent_id' => $asia->id, 'name' => 'Israel', 'code' => 'ISR', 'phone_code' => '+972'],
            ['continent_id' => $asia->id, 'name' => 'Turkey', 'code' => 'TUR', 'phone_code' => '+90'],

            // Europe
            ['continent_id' => $europe->id, 'name' => 'United Kingdom', 'code' => 'GBR', 'phone_code' => '+44'],
            ['continent_id' => $europe->id, 'name' => 'Germany', 'code' => 'DEU', 'phone_code' => '+49'],
            ['continent_id' => $europe->id, 'name' => 'France', 'code' => 'FRA', 'phone_code' => '+33'],
            ['continent_id' => $europe->id, 'name' => 'Italy', 'code' => 'ITA', 'phone_code' => '+39'],
            ['continent_id' => $europe->id, 'name' => 'Spain', 'code' => 'ESP', 'phone_code' => '+34'],
            ['continent_id' => $europe->id, 'name' => 'Netherlands', 'code' => 'NLD', 'phone_code' => '+31'],
            ['continent_id' => $europe->id, 'name' => 'Switzerland', 'code' => 'CHE', 'phone_code' => '+41'],
            ['continent_id' => $europe->id, 'name' => 'Sweden', 'code' => 'SWE', 'phone_code' => '+46'],
            ['continent_id' => $europe->id, 'name' => 'Norway', 'code' => 'NOR', 'phone_code' => '+47'],
            ['continent_id' => $europe->id, 'name' => 'Denmark', 'code' => 'DNK', 'phone_code' => '+45'],
            ['continent_id' => $europe->id, 'name' => 'Belgium', 'code' => 'BEL', 'phone_code' => '+32'],
            ['continent_id' => $europe->id, 'name' => 'Austria', 'code' => 'AUT', 'phone_code' => '+43'],
            ['continent_id' => $europe->id, 'name' => 'Poland', 'code' => 'POL', 'phone_code' => '+48'],
            ['continent_id' => $europe->id, 'name' => 'Russia', 'code' => 'RUS', 'phone_code' => '+7'],
            ['continent_id' => $europe->id, 'name' => 'Portugal', 'code' => 'PRT', 'phone_code' => '+351'],
            ['continent_id' => $europe->id, 'name' => 'Greece', 'code' => 'GRC', 'phone_code' => '+30'],
            ['continent_id' => $europe->id, 'name' => 'Ireland', 'code' => 'IRL', 'phone_code' => '+353'],

            // North America
            ['continent_id' => $northAmerica->id, 'name' => 'United States', 'code' => 'USA', 'phone_code' => '+1'],
            ['continent_id' => $northAmerica->id, 'name' => 'Canada', 'code' => 'CAN', 'phone_code' => '+1'],
            ['continent_id' => $northAmerica->id, 'name' => 'Mexico', 'code' => 'MEX', 'phone_code' => '+52'],
            ['continent_id' => $northAmerica->id, 'name' => 'Cuba', 'code' => 'CUB', 'phone_code' => '+53'],
            ['continent_id' => $northAmerica->id, 'name' => 'Jamaica', 'code' => 'JAM', 'phone_code' => '+1-876'],
            ['continent_id' => $northAmerica->id, 'name' => 'Costa Rica', 'code' => 'CRI', 'phone_code' => '+506'],
            ['continent_id' => $northAmerica->id, 'name' => 'Panama', 'code' => 'PAN', 'phone_code' => '+507'],

            // South America
            ['continent_id' => $southAmerica->id, 'name' => 'Brazil', 'code' => 'BRA', 'phone_code' => '+55'],
            ['continent_id' => $southAmerica->id, 'name' => 'Argentina', 'code' => 'ARG', 'phone_code' => '+54'],
            ['continent_id' => $southAmerica->id, 'name' => 'Chile', 'code' => 'CHL', 'phone_code' => '+56'],
            ['continent_id' => $southAmerica->id, 'name' => 'Colombia', 'code' => 'COL', 'phone_code' => '+57'],
            ['continent_id' => $southAmerica->id, 'name' => 'Peru', 'code' => 'PER', 'phone_code' => '+51'],
            ['continent_id' => $southAmerica->id, 'name' => 'Venezuela', 'code' => 'VEN', 'phone_code' => '+58'],
            ['continent_id' => $southAmerica->id, 'name' => 'Ecuador', 'code' => 'ECU', 'phone_code' => '+593'],
            ['continent_id' => $southAmerica->id, 'name' => 'Uruguay', 'code' => 'URY', 'phone_code' => '+598'],

            // Oceania
            ['continent_id' => $oceania->id, 'name' => 'Australia', 'code' => 'AUS', 'phone_code' => '+61'],
            ['continent_id' => $oceania->id, 'name' => 'New Zealand', 'code' => 'NZL', 'phone_code' => '+64'],
            ['continent_id' => $oceania->id, 'name' => 'Fiji', 'code' => 'FJI', 'phone_code' => '+679'],
            ['continent_id' => $oceania->id, 'name' => 'Papua New Guinea', 'code' => 'PNG', 'phone_code' => '+675'],
        ];

        foreach ($countries as $country) {
            Country::updateOrCreate(
                ['code' => $country['code']],
                $country
            );
        }

        $this->command->info('Countries seeded successfully! Total: ' . count($countries));
    }
}
