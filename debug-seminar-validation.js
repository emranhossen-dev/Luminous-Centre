const debugSeminarValidation = async () => {
  try {
    console.log('Debugging seminar validation...\n');
    
    // Test phone number validation
    const phoneRegex = /^(?:\+880|01)?[3-9]\d{8}$/;
    
    const testPhones = [
      '01712345678', // Valid
      '01887654321', // Valid
      '+8801712345678', // Valid
      '0123456789', // Invalid (starts with 012)
      '0171234567', // Invalid (too short)
      'abc12345678', // Invalid (contains letters)
      '01 712345678', // Invalid (contains space)
      '01-712345678'  // Invalid (contains dash)
    ];
    
    console.log('📱 Phone Number Validation:');
    testPhones.forEach(phone => {
      const cleanPhone = phone.replace(/[\s-]/g, '');
      const isValid = phoneRegex.test(cleanPhone);
      console.log(`  ${phone}: ${isValid ? '✅ Valid' : '❌ Invalid'}`);
    });
    
    // Test email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    const testEmails = [
      'test@example.com', // Valid
      'user@domain.org', // Valid
      'invalid-email', // Invalid
      'test@', // Invalid
      '@domain.com', // Invalid
      'test@domain', // Invalid
      'test@domain.' // Invalid
    ];
    
    console.log('\n📧 Email Validation:');
    testEmails.forEach(email => {
      const isValid = emailRegex.test(email);
      console.log(`  ${email}: ${isValid ? '✅ Valid' : '❌ Invalid'}`);
    });
    
    console.log('\n💡 Common Issues:');
    console.log('1. Phone number must start with 01, +880, or 013-019');
    console.log('2. Phone number must be exactly 11 digits (Bangladesh format)');
    console.log('3. Email must have proper format: user@domain.com');
    console.log('4. All fields are required: fullName, mobileNo, email, course, category, whatsappNo');
    
    console.log('\n🔍 What to Check:');
    console.log('1. Are all form fields filled?');
    console.log('2. Is phone number in correct format?');
    console.log('3. Is email in correct format?');
    console.log('4. Is course selected from dropdown?');
    console.log('5. Is category selected from dropdown?');
    
  } catch (error) {
    console.error('Debug error:', error);
  }
};

debugSeminarValidation();
