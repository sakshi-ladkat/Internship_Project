# Location Models & Registration Token Updates

## Summary

Successfully implemented Continent and Country models with database-driven location data and extended registration token expiration to 24 hours.

---

## 1. Location Models Implementation

### Models Created

#### **Continent Model** (`app/Models/Continent.php`)
```php
class Continent extends Model
{
    protected $fillable = ['name', 'code', 'is_active'];
    
    // Relationships
    public function countries(): HasMany
    public function activeCountries(): HasMany
    
    // Scopes
    public function scopeActive($query)
}
```

**Fields:**
- `id` - Primary key
- `name` - Continent name (e.g., "Asia", "Europe")
- `code` - 2-letter code (e.g., "AS", "EU")
- `is_active` - Boolean flag
- `timestamps` - Created/updated timestamps

#### **Country Model** (`app/Models/Country.php`)
```php
class Country extends Model
{
    protected $fillable = ['continent_id', 'name', 'code', 'phone_code', 'is_active'];
    
    // Relationships
    public function continent(): BelongsTo
    
    // Scopes
    public function scopeActive($query)
    public function scopeByContinent($query, $continentId)
}
```

**Fields:**
- `id` - Primary key
- `continent_id` - Foreign key to continents table
- `name` - Country name (e.g., "India", "United States")
- `code` - 3-letter ISO code (e.g., "IND", "USA")
- `phone_code` - International dialing code (e.g., "+91", "+1")
- `is_active` - Boolean flag
- `timestamps` - Created/updated timestamps

### Database Migrations

#### Continents Table
```php
Schema::create('continents', function (Blueprint $table) {
    $table->id();
    $table->string('name', 100)->unique();
    $table->string('code', 2)->unique();
    $table->boolean('is_active')->default(true);
    $table->timestamps();
});
```

#### Countries Table
```php
Schema::create('countries', function (Blueprint $table) {
    $table->id();
    $table->foreignId('continent_id')->constrained()->onDelete('cascade');
    $table->string('name', 100);
    $table->string('code', 3)->unique();
    $table->string('phone_code', 10)->nullable();
    $table->boolean('is_active')->default(true);
    $table->timestamps();
    
    $table->index('continent_id');
});
```

### Seeders

#### ContinentSeeder
Seeds 7 continents:
- Africa (AF)
- Antarctica (AN)
- Asia (AS)
- Europe (EU)
- North America (NA)
- Oceania (OC)
- South America (SA)

#### CountrySeeder
Seeds **59 countries** with phone codes, including:
- **Africa:** Egypt, Nigeria, South Africa, Kenya, Morocco, Ghana, Ethiopia
- **Asia:** China, India, Japan, South Korea, Singapore, Thailand, Indonesia, Malaysia, Philippines, Vietnam, Pakistan, Bangladesh, Saudi Arabia, UAE, Israel, Turkey
- **Europe:** UK, Germany, France, Italy, Spain, Netherlands, Switzerland, Sweden, Norway, Denmark, Belgium, Austria, Poland, Russia, Portugal, Greece, Ireland
- **North America:** USA, Canada, Mexico, Cuba, Jamaica, Costa Rica, Panama
- **South America:** Brazil, Argentina, Chile, Colombia, Peru, Venezuela, Ecuador, Uruguay
- **Oceania:** Australia, New Zealand, Fiji, Papua New Guinea

---

## 2. Updated LocationController

### New Endpoints

#### Get All Continents
```
GET /api/locations/continents
```
**Response:**
```json
{
  "continents": [
    {
      "id": 1,
      "name": "Africa",
      "code": "AF"
    }
  ]
}
```

#### Get Countries by Continent ID
```
POST /api/locations/countries-by-id
Body: { "continent_id": 3 }
```
**Response:**
```json
{
  "countries": [
    {
      "id": 8,
      "name": "China",
      "code": "CHN",
      "phone_code": "+86"
    },
    {
      "id": 9,
      "name": "India",
      "code": "IND",
      "phone_code": "+91"
    }
  ]
}
```

#### Get Countries by Continent Name (Legacy)
```
POST /api/locations/countries
Body: { "continent": "Asia" }
```
**Response:** Same as above

#### Get All Countries
```
GET /api/locations/countries/all
```

#### Get Specific Country
```
GET /api/locations/countries/{id}
```

### Phone Code Feature

✅ **Phone codes are automatically fetched** with country data
- Stored in `phone_code` field in countries table
- Returned in all country API responses
- Includes international dialing codes (e.g., +1, +91, +44)

**Example Usage:**
```javascript
// Frontend can now display phone codes in dropdowns
const response = await fetch('/api/locations/countries-by-id', {
    method: 'POST',
    body: JSON.stringify({ continent_id: 3 })
});
const data = await response.json();

// data.countries[0].phone_code = "+91" for India
```

---

## 3. Registration Token Expiration Extended

### Changes Made

#### Email Verification Token
**Before:** 15 minutes  
**After:** 24 hours

```php
// RegistrationController.php - sendVerificationLink()
Cache::put($cacheKey, [...], now()->addHours(24));
```

#### Session Token (After Email Verification)
**Before:** 1 hour  
**After:** 24 hours

```php
// RegistrationController.php - verifyEmail()
Cache::put($cacheKey, [...], now()->addHours(24));
```

#### Password Setup Token
**Before:** 24 hours (unchanged)  
**After:** 24 hours (maintained)

```php
// RegistrationController.php - saveRegistrationData()
Cache::put($passwordCacheKey, [...], now()->addHours(24));
```

#### Email Template
Updated `VerificationMail.php`:
```php
'expiresInMinutes' => 1440 // 24 hours = 1440 minutes
```

Email now displays: **"This verification link expires in 24 hours"**

---

## 4. Frontend Integration

### Fetching Continents
```javascript
const response = await fetch(`${CONFIG.API_BASE_URL}/api/locations/continents`);
const data = await response.json();
// data.continents = [{ id: 1, name: "Africa", code: "AF" }, ...]
```

### Fetching Countries by Continent
```javascript
// Option 1: By ID (recommended)
const response = await fetch(`${CONFIG.API_BASE_URL}/api/locations/countries-by-id`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ continent_id: selectedContinentId })
});

// Option 2: By Name (legacy support)
const response = await fetch(`${CONFIG.API_BASE_URL}/api/locations/countries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ continent: "Asia" })
});

const data = await response.json();
// data.countries = [{ id: 9, name: "India", code: "IND", phone_code: "+91" }, ...]
```

### Displaying Phone Codes
```javascript
// Populate country dropdown with phone codes
countries.forEach(country => {
    const option = document.createElement('option');
    option.value = country.id;
    option.textContent = `${country.name} (${country.phone_code})`;
    countrySelect.appendChild(option);
});
```

---

## 5. Database Commands

### Run Migrations
```bash
php artisan migrate
```

### Seed Data
```bash
# Seed continents
php artisan db:seed --class=ContinentSeeder

# Seed countries
php artisan db:seed --class=CountrySeeder

# Or seed all
php artisan db:seed
```

### Verify Data
```sql
-- Check continents
SELECT * FROM continents;

-- Check countries
SELECT c.name as country, co.name as continent, c.phone_code 
FROM countries c 
JOIN continents co ON c.continent_id = co.id 
ORDER BY co.name, c.name;

-- Count by continent
SELECT co.name, COUNT(c.id) as country_count 
FROM continents co 
LEFT JOIN countries c ON c.continent_id = co.id 
GROUP BY co.id, co.name;
```

---

## 6. Benefits

### Database-Driven Locations
✅ Easy to add/update countries without code changes  
✅ Consistent data across application  
✅ Supports internationalization  
✅ Phone codes included automatically  
✅ Active/inactive flags for management  

### Extended Token Expiration
✅ Users have 24 hours to complete registration  
✅ Reduces support requests for expired links  
✅ Better user experience  
✅ Consistent across all registration steps  

### Relationships
✅ One continent has many countries  
✅ Cascade delete (deleting continent removes its countries)  
✅ Efficient queries with indexes  
✅ Eager loading support  

---

## 7. API Testing

### Test Continents
```bash
curl http://127.0.0.1:8000/api/locations/continents
```

### Test Countries by Continent ID
```bash
curl -X POST http://127.0.0.1:8000/api/locations/countries-by-id \
  -H "Content-Type: application/json" \
  -d '{"continent_id": 3}'
```

### Test Countries by Name (Legacy)
```bash
curl -X POST http://127.0.0.1:8000/api/locations/countries \
  -H "Content-Type: application/json" \
  -d '{"continent": "Asia"}'
```

### Test Phone Codes
```bash
curl http://127.0.0.1:8000/api/locations/countries/all | jq '.countries[] | {name, phone_code}'
```

---

## 8. Files Created/Modified

### Created
- ✅ `app/Models/Continent.php`
- ✅ `app/Models/Country.php`
- ✅ `database/migrations/2026_02_09_104414_create_continents_table.php`
- ✅ `database/migrations/2026_02_09_104418_create_countries_table.php`
- ✅ `database/seeders/ContinentSeeder.php`
- ✅ `database/seeders/CountrySeeder.php`

### Modified
- ✅ `app/Http/Controllers/LocationController.php` - Database queries instead of hardcoded arrays
- ✅ `app/Http/Controllers/RegistrationController.php` - 24-hour token expiration
- ✅ `app/Mail/VerificationMail.php` - Updated expiration display
- ✅ `database/seeders/DatabaseSeeder.php` - Added location seeders

---

## 9. Migration Status

```
✅ Continents table created
✅ Countries table created
✅ 7 continents seeded
✅ 59 countries seeded
✅ Phone codes populated
✅ Relationships established
✅ Token expiration extended to 24 hours
```

---

## 10. Next Steps

### Optional Enhancements
1. Add more countries to seeder
2. Create admin interface for managing locations
3. Add country flags/icons
4. Implement caching for location data
5. Add timezone information to countries
6. Add currency codes

### Frontend Updates Needed
1. Update registration form to use continent IDs
2. Display phone codes in country dropdown
3. Handle phone code selection
4. Update validation for phone numbers

---

**Last Updated:** 2026-02-09  
**Status:** ✅ Complete  
**Version:** 1.0
