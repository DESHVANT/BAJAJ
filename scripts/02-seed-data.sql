-- Insert sample users for demo
INSERT INTO users (name, total_points) VALUES 
    ('Alice Johnson', 85),
    ('Bob Smith', 72),
    ('Carol Davis', 91),
    ('David Wilson', 68),
    ('Emma Brown', 79),
    ('Frank Miller', 56),
    ('Grace Lee', 83),
    ('Henry Taylor', 94),
    ('Ivy Chen', 77),
    ('Jack Anderson', 62)
ON CONFLICT (name) DO NOTHING;

-- Insert sample claim history for demo
INSERT INTO claim_history (user_id, user_name, points, timestamp) VALUES 
    (1, 'Alice Johnson', 8, NOW() - INTERVAL '5 minutes'),
    (3, 'Carol Davis', 6, NOW() - INTERVAL '10 minutes'),
    (8, 'Henry Taylor', 9, NOW() - INTERVAL '15 minutes'),
    (2, 'Bob Smith', 4, NOW() - INTERVAL '20 minutes'),
    (5, 'Emma Brown', 7, NOW() - INTERVAL '25 minutes'),
    (7, 'Grace Lee', 5, NOW() - INTERVAL '30 minutes'),
    (4, 'David Wilson', 3, NOW() - INTERVAL '35 minutes'),
    (9, 'Ivy Chen', 8, NOW() - INTERVAL '40 minutes'),
    (6, 'Frank Miller', 6, NOW() - INTERVAL '45 minutes'),
    (10, 'Jack Anderson', 4, NOW() - INTERVAL '50 minutes');
