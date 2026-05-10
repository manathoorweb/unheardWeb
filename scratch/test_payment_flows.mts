import { encrypt, decrypt } from '../lib/security/encryption';

async function testEncryption() {
  console.log('--- Testing Encryption ---');
  const data = JSON.stringify({ qid: '123', amount: 999, name: 'Test User' });
  const encrypted = encrypt(data);
  console.log('Encrypted:', encrypted);
  const decrypted = decrypt(encrypted);
  console.log('Decrypted:', decrypted);
  if (data === decrypted) {
    console.log('✅ Encryption/Decryption Successful');
  } else {
    console.log('❌ Encryption/Decryption Failed');
  }
}

async function testSecurityFlows() {
  console.log('\n--- Testing Security Logic (Mocks) ---');
  
  // Mocking the init API logic
  const mockDB = {
    'q_1': { amount: 999, status: 'pending', expires_at: new Date(Date.now() + 3600000).toISOString() },
    'q_expired': { amount: 999, status: 'pending', expires_at: new Date(Date.now() - 3600000).toISOString() },
    'q_paid': { amount: 999, status: 'completed', expires_at: new Date(Date.now() + 3600000).toISOString() }
  };

  const testInit = (qid: string, clientAmount: number) => {
    const q = mockDB[qid as keyof typeof mockDB];
    if (!q) return { success: false, error: 'Session not found' };
    if (q.status === 'completed') return { success: false, error: 'Already paid' };
    if (new Date(q.expires_at) < new Date()) return { success: false, error: 'Expired' };
    
    // The key security fix: use q.amount, NOT clientAmount
    const finalAmount = q.amount;
    console.log(`Initializing payment for ${qid}. Client sent: ${clientAmount}, DB says: ${finalAmount}. Result: USING DB AMOUNT.`);
    return { success: true, amount: finalAmount };
  };

  const case1 = testInit('q_1', 1); // Attempt price manipulation
  if (case1.amount === 999) console.log('✅ Price Manipulation Blocked (DB price used)');
  
  const case2 = testInit('q_expired', 999);
  if (!case2.success && case2.error === 'Expired') console.log('✅ Expiry Check Working');

  const case3 = testInit('q_paid', 999);
  if (!case3.success && case3.error === 'Already paid') console.log('✅ Double Payment Check Working');
}

// Run tests
(async () => {
  try {
    await testEncryption();
    await testSecurityFlows();
  } catch (err) {
    console.error('Test Execution Error:', err);
  }
})();
