const nodemailer = require('nodemailer');
require('dotenv').config();

// OAuth2 client setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        type: 'OAuth2',
        user: 'marygrace.dapdap@bicol-u.edu.ph', // Replace with your Gmail address
        clientId: '713389655695-77ofleooid780etvc11juhdbjk1q3asg.apps.googleusercontent.com',
        clientSecret: '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',
        refreshToken: '1//041tyXa8jZ3flCgYIARAAGAQSNwF-L9IrSi86k0QzMO-9N-en-2U5Z_avP_kEFeg8wBlGlKkMt7PSKjvLje0sFFaUFc37Sswf3tI',
        accessToken: 'ya29.a0AXooCgsvF9Nj98NiXEu2BzLH-BBC8xgFIT7dakb_nI162U6vKzK7I0PXQb6Pyo23S4rBVmP1t80KhymYeSfIYmRENmUHcYMn13dSO2amNXWVV5Zf-fCQ8bY2rbqP5p0UghI1iSUjgG8JgwkKkpOeR3HwUYkMMqFS87_42waCgYKAUMSARASFQHGX2MiVLHIOH32KZMyhnqA48mIyQ0173' // Optional but recommended
    }
});

module.exports = transporter;
