-- Update admin user password hash
UPDATE users 
SET password_hash = '$2a$12$8CwdkVsndXNdxz44CBrVJ.9EzpY/O0ig0cQftsZQHEV5Lk74/SXPC'
WHERE email = 'admin@luminous.com';

-- Update other test users if they exist
UPDATE users 
SET password_hash = '$2a$12$p8BmIjZIodkzM2nFbcdMAOV2IlZBl2.oMCkmZmcA81V8phxWtjBsG'
WHERE email = 'employee@luminous.com';

UPDATE users 
SET password_hash = '$2a$12$nxBPF7w0BlGxQW3H4rI4bu3cZZ58YSxh1oH66f24KfQneEeJ.OkZC'
WHERE email = 'mentor@luminous.com';

UPDATE users 
SET password_hash = '$2a$12$lOwRXtzVQ8DGRyoco.w6Z.3s497c.qb.ktDlj.3k3ncsWQ0h.gH2S'
WHERE email = 'student@luminous.com';

-- Show updated users
SELECT email, first_name, last_name, role_id, is_active 
FROM users 
WHERE email IN ('admin@luminous.com', 'employee@luminous.com', 'mentor@luminous.com', 'student@luminous.com');
