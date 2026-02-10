<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserProfile;
use App\Models\AcademicInformation;
use App\Models\AffiliationDetail;
use App\Models\ProjectDetail;
use App\Models\Supervisor;
use App\Models\Institute;
use App\Models\Department;
use App\Models\SubDepartment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    /**
     * Get complete user profile
     */
    public function getProfile(Request $request)
    {
        $token = $request->bearerToken() ?? $request->input('token');
        
        if (!$token) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $userId = Cache::get('auth_token:' . $token);
        
        if (!$userId) {
            return response()->json(['message' => 'Invalid or expired token'], 401);
        }

        $user = User::with([
            'profile',
            'academicInformation',
            'affiliationDetails',
            'projectDetails.supervisor',
            'projectDetails.institute',
            'projectDetails.department',
            'projectDetails.subDepartment'
        ])->find($userId);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        return response()->json([
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'email' => $user->email
            ],
            'profile' => $user->profile,
            'academic' => $user->academicInformation,
            'affiliation' => $user->affiliationDetails,
            'projects' => $user->projectDetails
        ], 200);
    }

    /**
     * Save personal information
     */
    public function savePersonalInfo(Request $request)
    {
        $token = $request->bearerToken() ?? $request->input('token');
        
        if (!$token) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $userId = Cache::get('auth_token:' . $token);
        
        if (!$userId) {
            return response()->json(['message' => 'Invalid or expired token'], 401);
        }

        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name' => 'required|string|max:255',
            'date_of_birth' => 'required|date',
            'gender' => 'required|in:Male,Female,Prefer not to say',
            'country_code' => 'required|string|max:10',
            'mobile_number' => 'required|string|max:20',
            'personal_email' => 'nullable|email',
            'alternate_email' => 'nullable|email',
            'address_line1' => 'required|string',
            'address_line2' => 'nullable|string',
            'address_line3' => 'nullable|string',
            'city' => 'required|string',
            'state' => 'required|string',
            'country' => 'required|string',
            'postal_code' => 'required|string|max:20',
            'nationality' => 'required|string',
            'country_of_citizenship' => 'required|string',
            'student_type' => 'required|in:Internal Student,External Student'
        ]);

        $profile = UserProfile::updateOrCreate(
            ['user_id' => $userId],
            array_merge($validated, ['user_id' => $userId])
        );

        return response()->json([
            'message' => 'Personal information saved successfully',
            'profile' => $profile
        ], 200);
    }

    /**
     * Upload profile photo
     */
    public function uploadProfilePhoto(Request $request)
    {
        $token = $request->bearerToken() ?? $request->input('token');
        
        if (!$token) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $userId = Cache::get('auth_token:' . $token);
        
        if (!$userId) {
            return response()->json(['message' => 'Invalid or expired token'], 401);
        }

        $request->validate([
            'profile_photo' => 'required|image|mimes:jpeg,png,jpg|max:2048'
        ]);

        if ($request->hasFile('profile_photo')) {
            $file = $request->file('profile_photo');
            $filename = 'profile_' . $userId . '_' . time() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('profile_photos', $filename, 'public');

            $profile = UserProfile::updateOrCreate(
                ['user_id' => $userId],
                ['profile_photo' => $path]
            );

            return response()->json([
                'message' => 'Profile photo uploaded successfully',
                'photo_url' => Storage::url($path)
            ], 200);
        }

        return response()->json(['message' => 'No file uploaded'], 400);
    }

    /**
     * Save academic information
     */
    public function saveAcademicInfo(Request $request)
    {
        $token = $request->bearerToken() ?? $request->input('token');
        
        if (!$token) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $userId = Cache::get('auth_token:' . $token);
        
        if (!$userId) {
            return response()->json(['message' => 'Invalid or expired token'], 401);
        }

        // Data can be a single object or an array of objects
        $academicData = $request->all();
        $entries = isset($academicData[0]) ? $academicData : [$academicData];

        // Clear existing academic info for this user
        AcademicInformation::where('user_id', $userId)->delete();

        $savedEntries = [];
        foreach ($entries as $entry) {
            // Basic validation for each entry
            if (!isset($entry['degree_level']) || !isset($entry['degree_title'])) continue;

            $savedEntries[] = AcademicInformation::create([
                'user_id' => $userId,
                'degree_level' => $entry['degree_level'],
                'degree_title' => $entry['degree_title'],
                'specialization' => $entry['specialization'] ?? null,
                'institute_name' => $entry['institute_name'],
                'institute_country' => $entry['institute_country'],
                'start_date' => $entry['start_date'],
                'end_date' => $entry['end_date'] ?? null,
                'grading_system' => $entry['grading_system'],
                'grade_value' => $entry['grade_value'],
                'is_current' => $entry['is_current'] ?? false
            ]);
        }

        return response()->json([
            'message' => 'Academic information saved successfully',
            'academic' => $savedEntries
        ], 200);
    }

    /**
     * Save affiliation details
     */
    public function saveAffiliationInfo(Request $request)
    {
        $token = $request->bearerToken() ?? $request->input('token');
        
        if (!$token) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $userId = Cache::get('auth_token:' . $token);
        
        if (!$userId) {
            return response()->json(['message' => 'Invalid or expired token'], 401);
        }

        $validated = $request->validate([
            'current_affiliation' => 'required|in:Student,Researcher,Faculty,Industry Professional,Independent Researcher',
            'affiliated_organization' => 'required|string',
            'country' => 'required|string',
            'position_role' => 'required|string',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after:start_date'
        ]);

        $affiliation = AffiliationDetail::updateOrCreate(
            ['user_id' => $userId],
            array_merge($validated, ['user_id' => $userId])
        );

        return response()->json([
            'message' => 'Affiliation details saved successfully',
            'affiliation' => $affiliation
        ], 200);
    }

    /**
     * Save project details
     */
    public function saveProjectInfo(Request $request)
    {
        $token = $request->bearerToken() ?? $request->input('token');
        
        if (!$token) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $userId = Cache::get('auth_token:' . $token);
        
        if (!$userId) {
            return response()->json(['message' => 'Invalid or expired token'], 401);
        }

        $validated = $request->validate([
            'supervisor_id' => 'required|exists:supervisors,id',
            'institute_id' => 'required|exists:institutes,id',
            'department_id' => 'required|exists:departments,id',
            'sub_department_id' => 'nullable|exists:sub_departments,id',
            'country' => 'required|string',
            'project_title' => 'nullable|string',
            'project_description' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after:start_date'
        ]);

        $project = ProjectDetail::updateOrCreate(
            ['user_id' => $userId],
            array_merge($validated, ['user_id' => $userId])
        );

        return response()->json([
            'message' => 'Project details saved successfully',
            'project' => $project
        ], 200);
    }

    /**
     * Get master data for dropdowns
     */
    public function getMasterData()
    {
        return response()->json([
            'supervisors' => Supervisor::all(),
            'institutes' => Institute::all(),
            'departments' => Department::with('institute')->get(),
            'sub_departments' => SubDepartment::with('department')->get(),
            'countries' => $this->getCountries()
        ], 200);
    }

    /**
     * Get departments by institute
     */
    public function getDepartmentsByInstitute($instituteId)
    {
        $departments = Department::where('institute_id', $instituteId)->get();
        return response()->json(['departments' => $departments], 200);
    }

    /**
     * Get sub-departments by department
     */
    public function getSubDepartmentsByDepartment($departmentId)
    {
        $subDepartments = SubDepartment::where('department_id', $departmentId)->get();
        return response()->json(['sub_departments' => $subDepartments], 200);
    }

    /**
     * Get cities by state (for India)
     */
    public function getCitiesByState($state)
    {
        $cities = $this->getIndianStatesAndCities()[$state] ?? [];
        return response()->json(['cities' => $cities], 200);
    }

    /**
     * Get list of countries
     */
    private function getCountries()
    {
        return [
            'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan',
            'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan', 'Bolivia',
            'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi',
            'Cambodia', 'Cameroon', 'Canada', 'Cape Verde', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia',
            'Comoros', 'Congo', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic',
            'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic',
            'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Ethiopia',
            'Fiji', 'Finland', 'France',
            'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana',
            'Haiti', 'Honduras', 'Hungary',
            'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy',
            'Jamaica', 'Japan', 'Jordan',
            'Kazakhstan', 'Kenya', 'Kiribati', 'Korea North', 'Korea South', 'Kuwait', 'Kyrgyzstan',
            'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg',
            'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius',
            'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar',
            'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'Norway',
            'Oman',
            'Pakistan', 'Palau', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal',
            'Qatar',
            'Romania', 'Russia', 'Rwanda',
            'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino',
            'Sao Tome and Principe', 'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore',
            'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'South Sudan', 'Spain', 'Sri Lanka',
            'Sudan', 'Suriname', 'Swaziland', 'Sweden', 'Switzerland', 'Syria',
            'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey',
            'Turkmenistan', 'Tuvalu',
            'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan',
            'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam',
            'Yemen',
            'Zambia', 'Zimbabwe'
        ];
    }

    /**
     * Get Indian states and cities
     */
    private function getIndianStatesAndCities()
    {
        return [
            "Andhra Pradesh" => ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Rajahmundry", "Tirupati"],
            "Arunachal Pradesh" => ["Itanagar", "Naharlagun", "Tawang", "Ziro"],
            "Assam" => ["Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Tezpur"],
            "Bihar" => ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Darbhanga", "Purnia"],
            "Chhattisgarh" => ["Raipur", "Bilaspur", "Durg", "Bhilai", "Korba"],
            "Goa" => ["Panaji", "Margao", "Vasco da Gama", "Mapusa"],
            "Gujarat" => ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Junagadh"],
            "Haryana" => ["Gurugram", "Faridabad", "Panipat", "Ambala", "Hisar", "Karnal", "Rohtak"],
            "Himachal Pradesh" => ["Shimla", "Mandi", "Solan", "Dharamshala", "Hamirpur"],
            "Jharkhand" => ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Hazaribagh"],
            "Karnataka" => ["Bengaluru", "Mysuru", "Mangaluru", "Hubballi", "Dharwad", "Belagavi", "Ballari", "Shivamogga"],
            "Kerala" => ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam", "Alappuzha", "Palakkad"],
            "Madhya Pradesh" => ["Bhopal", "Indore", "Jabalpur", "Gwalior", "Ujjain", "Sagar", "Rewa", "Satna"],
            "Maharashtra" => ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad", "Thane", "Kalyan-Dombivli", "Solapur", "Kolhapur", "Sangli", "Amravati", "Akola"],
            "Manipur" => ["Imphal", "Thoubal", "Churachandpur"],
            "Meghalaya" => ["Shillong", "Tura", "Jowai"],
            "Mizoram" => ["Aizawl", "Lunglei", "Champhai"],
            "Nagaland" => ["Kohima", "Dimapur", "Mokokchung"],
            "Odisha" => ["Bhubaneswar", "Cuttack", "Rourkela", "Sambalpur", "Berhampur", "Balasore", "Baripada"],
            "Punjab" => ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali"],
            "Rajasthan" => ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer", "Bikaner", "Alwar", "Bharatpur"],
            "Sikkim" => ["Gangtok", "Namchi", "Gyalshing"],
            "Tamil Nadu" => ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Erode", "Vellore"],
            "Telangana" => ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam"],
            "Tripura" => ["Agartala", "Udaipur", "Dharmanagar"],
            "Uttar Pradesh" => ["Lucknow", "Kanpur", "Noida", "Ghaziabad", "Agra", "Varanasi", "Prayagraj", "Meerut", "Bareilly", "Moradabad", "Aligarh", "Jhansi"],
            "Uttarakhand" => ["Dehradun", "Haridwar", "Roorkee", "Haldwani", "Rudrapur"],
            "West Bengal" => ["Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri", "Kharagpur"],
            "Andaman and Nicobar Islands" => ["Port Blair"],
            "Chandigarh" => ["Chandigarh"],
            "Dadra and Nagar Haveli and Daman and Diu" => ["Daman", "Silvassa", "Diu"],
            "Delhi" => ["New Delhi", "Dwarka", "Rohini", "Saket", "Karol Bagh", "Laxmi Nagar"],
            "Jammu and Kashmir" => ["Srinagar", "Jammu", "Anantnag", "Baramulla"],
            "Ladakh" => ["Leh", "Kargil"],
            "Lakshadweep" => ["Kavaratti"],
            "Puducherry" => ["Puducherry", "Karaikal", "Mahe", "Yanam"]
        ];
    }
}
