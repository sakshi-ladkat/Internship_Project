<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Supervisor;
use App\Models\Institute;
use App\Models\Department;
use App\Models\SubDepartment;

class MasterDataSeeder extends Seeder
{
    public function run(): void
    {
        // Create Supervisors
        $supervisors = [
            ['name' => 'Dr. John Smith', 'email' => 'john.smith@university.edu', 'department' => 'Computer Science'],
            ['name' => 'Dr. Sarah Johnson', 'email' => 'sarah.j@university.edu', 'department' => 'Physics'],
            ['name' => 'Dr. Michael Chen', 'email' => 'michael.chen@university.edu', 'department' => 'Engineering'],
            ['name' => 'Dr. Emily Davis', 'email' => 'emily.davis@university.edu', 'department' => 'Mathematics'],
            ['name' => 'Dr. Robert Wilson', 'email' => 'robert.w@university.edu', 'department' => 'Chemistry'],
        ];

        foreach ($supervisors as $supervisor) {
            Supervisor::create($supervisor);
        }

        // Create Institutes
        $institutes = [
            ['name' => 'Massachusetts Institute of Technology', 'country' => 'United States'],
            ['name' => 'Stanford University', 'country' => 'United States'],
            ['name' => 'University of Oxford', 'country' => 'United Kingdom'],
            ['name' => 'Indian Institute of Technology', 'country' => 'India'],
            ['name' => 'National University of Singapore', 'country' => 'Singapore'],
        ];

        foreach ($institutes as $instituteData) {
            $institute = Institute::create($instituteData);

            // Create Departments for each Institute
            $departments = [
                'Computer Science',
                'Electrical Engineering',
                'Mechanical Engineering',
                'Physics',
                'Mathematics',
                'Chemistry',
                'Biology'
            ];

            foreach ($departments as $deptName) {
                $dept = Department::create([
                    'institute_id' => $institute->id,
                    'name' => $deptName
                ]);

                // Create Sub-departments
                if ($deptName === 'Computer Science') {
                    $subDepts = ['Artificial Intelligence', 'Data Science', 'Cybersecurity', 'Software Engineering'];
                } elseif ($deptName === 'Electrical Engineering') {
                    $subDepts = ['Power Systems', 'Electronics', 'Communications', 'Control Systems'];
                } elseif ($deptName === 'Mechanical Engineering') {
                    $subDepts = ['Thermodynamics', 'Robotics', 'Manufacturing', 'Automotive'];
                } else {
                    $subDepts = ['Research', 'Applied', 'Theoretical'];
                }

                foreach ($subDepts as $subDeptName) {
                    SubDepartment::create([
                        'department_id' => $dept->id,
                        'name' => $subDeptName
                    ]);
                }
            }
        }
    }
}
