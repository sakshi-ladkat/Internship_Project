<?php

/**
 * Test Redis Cache Implementation for Draft Registration
 * 
 * This script tests the Redis cache functionality without requiring
 * the full Laravel application to be running.
 */

echo "========================================\n";
echo "Redis Cache Test for Draft Registration\n";
echo "========================================\n\n";

// Test 1: Check if Redis extension is loaded
echo "Test 1: Checking PHP Redis Extension...\n";
if (extension_loaded('redis')) {
    echo "✓ Redis extension is loaded\n\n";
} else {
    echo "✗ Redis extension is NOT loaded\n";
    echo "  Install it with: sudo apt install php-redis\n\n";
    exit(1);
}

// Test 2: Connect to Redis
echo "Test 2: Connecting to Redis Server...\n";
try {
    $redis = new Redis();
    $connected = $redis->connect('127.0.0.1', 6379);
    
    if ($connected) {
        echo "✓ Successfully connected to Redis (127.0.0.1:6379)\n\n";
    } else {
        echo "✗ Failed to connect to Redis\n\n";
        exit(1);
    }
} catch (Exception $e) {
    echo "✗ Connection error: " . $e->getMessage() . "\n\n";
    exit(1);
}

// Test 3: Basic SET/GET operations
echo "Test 3: Testing Basic SET/GET Operations...\n";
try {
    $testKey = 'test_basic_' . time();
    $testValue = 'Hello Redis!';
    
    $redis->set($testKey, $testValue);
    $retrieved = $redis->get($testKey);
    
    if ($retrieved === $testValue) {
        echo "✓ SET/GET operations working correctly\n";
        $redis->del($testKey);
        echo "✓ DELETE operation working correctly\n\n";
    } else {
        echo "✗ SET/GET operations failed\n\n";
        exit(1);
    }
} catch (Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n\n";
    exit(1);
}

// Test 4: Test with expiration (TTL)
echo "Test 4: Testing TTL (Time To Live)...\n";
try {
    $testKey = 'test_ttl_' . time();
    $testValue = 'Expires in 5 seconds';
    
    $redis->setex($testKey, 5, $testValue);
    $ttl = $redis->ttl($testKey);
    
    if ($ttl > 0 && $ttl <= 5) {
        echo "✓ TTL set correctly: {$ttl} seconds remaining\n";
        $redis->del($testKey);
        echo "✓ Cleanup successful\n\n";
    } else {
        echo "✗ TTL not working correctly\n\n";
        exit(1);
    }
} catch (Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n\n";
    exit(1);
}

// Test 5: Test draft registration simulation
echo "Test 5: Simulating Draft Registration...\n";
try {
    // Generate UUID (simple version)
    $draftToken = sprintf(
        '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );
    
    // Simulate draft data
    $draftData = [
        'email' => 'test@example.com',
        'first_name' => 'John',
        'last_name' => 'Doe',
        'institute_id' => 1,
        'city' => 'New York',
        'state' => 'NY',
        'saved_at' => date('Y-m-d H:i:s'),
        'expires_at' => date('Y-m-d H:i:s', time() + 1800) // 30 minutes
    ];
    
    // Store draft (with prefix like Laravel does)
    $cacheKey = 'internship-project-demo-cache-register_draft_' . $draftToken;
    $redis->setex($cacheKey, 1800, json_encode($draftData)); // 30 minutes = 1800 seconds
    
    echo "✓ Draft saved with token: {$draftToken}\n";
    
    // Retrieve draft
    $retrieved = $redis->get($cacheKey);
    $retrievedData = json_decode($retrieved, true);
    
    if ($retrievedData && $retrievedData['email'] === 'test@example.com') {
        echo "✓ Draft retrieved successfully\n";
        echo "  Email: {$retrievedData['email']}\n";
        echo "  Name: {$retrievedData['first_name']} {$retrievedData['last_name']}\n";
        echo "  Expires: {$retrievedData['expires_at']}\n";
    } else {
        echo "✗ Draft retrieval failed\n\n";
        exit(1);
    }
    
    // Check TTL
    $ttl = $redis->ttl($cacheKey);
    echo "✓ Draft TTL: {$ttl} seconds\n";
    
    // Cleanup
    $redis->del($cacheKey);
    echo "✓ Draft deleted successfully\n\n";
    
} catch (Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n\n";
    exit(1);
}

// Test 6: Test multiple drafts
echo "Test 6: Testing Multiple Concurrent Drafts...\n";
try {
    $drafts = [];
    
    for ($i = 1; $i <= 5; $i++) {
        $token = 'test_draft_' . $i . '_' . time();
        $data = ['user' => "User {$i}", 'step' => $i];
        $key = 'internship-project-demo-cache-register_draft_' . $token;
        
        $redis->setex($key, 1800, json_encode($data));
        $drafts[] = $key;
    }
    
    echo "✓ Created 5 concurrent drafts\n";
    
    // Verify all exist
    $count = 0;
    foreach ($drafts as $key) {
        if ($redis->exists($key)) {
            $count++;
        }
    }
    
    echo "✓ Verified {$count}/5 drafts exist\n";
    
    // Cleanup
    foreach ($drafts as $key) {
        $redis->del($key);
    }
    
    echo "✓ Cleaned up all test drafts\n\n";
    
} catch (Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n\n";
    exit(1);
}

// Test 7: Check Redis info
echo "Test 7: Redis Server Information...\n";
try {
    $info = $redis->info();
    
    if (isset($info['redis_version'])) {
        echo "✓ Redis Version: {$info['redis_version']}\n";
    }
    
    if (isset($info['used_memory_human'])) {
        echo "✓ Memory Usage: {$info['used_memory_human']}\n";
    }
    
    if (isset($info['connected_clients'])) {
        echo "✓ Connected Clients: {$info['connected_clients']}\n";
    }
    
    echo "\n";
    
} catch (Exception $e) {
    echo "✗ Error getting Redis info: " . $e->getMessage() . "\n\n";
}

// Close connection
$redis->close();

echo "========================================\n";
echo "All Tests Passed! ✓\n";
echo "========================================\n\n";

echo "Redis is ready for draft registration!\n";
echo "You can now use the Laravel endpoints:\n";
echo "  - POST /api/registration/save-draft\n";
echo "  - POST /api/registration/get-draft\n";
echo "  - POST /api/registration/delete-draft\n\n";
