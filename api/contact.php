<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// If it's an OPTIONS request, just return headers
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Check if it's a POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

// Get POST data
$data = json_decode(file_get_contents('php://input'), true);

// Validate required fields
$required_fields = ['name', 'email', 'mobile', 'reason'];
foreach ($required_fields as $field) {
    if (empty($data[$field])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => "Missing required field: $field"]);
        exit();
    }
}

// Validate email
if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid email format']);
    exit();
}

// Configure email parameters
$to = 'your-email@example.com'; // Replace with your email address
$subject = 'New Contact Form Submission from MediEntry';

// Create email message
$message = "New contact form submission:\n\n";
$message .= "Name: " . htmlspecialchars($data['name']) . "\n";
$message .= "Email: " . htmlspecialchars($data['email']) . "\n";
$message .= "Mobile: " . htmlspecialchars($data['mobile']) . "\n";
$message .= "Reason: " . htmlspecialchars($data['reason']) . "\n";

// Email headers
$headers = [
    'From' => 'medientry@yourdomain.com', // Replace with your domain
    'Reply-To' => $data['email'],
    'X-Mailer' => 'PHP/' . phpversion(),
    'Content-Type' => 'text/plain; charset=utf-8'
];

// Send email
try {
    $mail_sent = mail($to, $subject, $message, $headers);
    
    if ($mail_sent) {
        echo json_encode([
            'success' => true,
            'message' => 'Thank you for your message. We will contact you soon!'
        ]);
    } else {
        throw new Exception('Failed to send email');
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Sorry, there was an error sending your message.'
    ]);
}