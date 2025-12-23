<?php

$file = __DIR__.'/app/Services/Notifications/NotificationDispatcher.php';
$content = file_get_contents($file);

// Fix line 76 - change event_key to event_id in preferences query
$content = str_replace(
    "->where('event_key', \$eventKey)",
    "->where('event_id', \$event->id)",
    $content
);

// Fix line 121 - keep event_key for NotificationLog (that table uses event_key)
// No change needed there

file_put_contents($file, $content);

echo "✅ Fixed NotificationDispatcher.php\n";
echo "Verifying syntax...\n";
system("php -l $file");
