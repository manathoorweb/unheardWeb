import { 
  StandardCheckoutClient, 
  Env, 
  PrefillUserLoginDetails, 
  StandardCheckoutPayRequest 
} from '@phonepe-pg/pg-sdk-node';

export class PhonePe {
  private static CLIENT_ID = process.env.PHONEPE_CLIENT_ID || '';
  private static CLIENT_SECRET = process.env.PHONEPE_CLIENT_SECRET || '';
  private static CLIENT_VERSION = Number(process.env.PHONEPE_CLIENT_VERSION) || 1;
  private static IS_PRODUCTION = process.env.PHONEPE_BASE_URL?.includes('api.phonepe.com') || false;

  private static client = StandardCheckoutClient.getInstance(
    this.CLIENT_ID,
    this.CLIENT_SECRET,
    this.CLIENT_VERSION,
    this.IS_PRODUCTION ? Env.PRODUCTION : Env.SANDBOX
  );

  /**
   * Initialize a V2 Checkout Payment using the official SDK (Redirect Flow)
   */
  static async initPayment(params: {
    transactionId: string;
    merchantUserId: string;
    amount: number; // in Rupees
    mobileNumber: string;
    callbackUrl: string;
    redirectUrl: string;
  }) {
    try {
      const amountInPaise = Math.round(params.amount * 100);
      const cleanPhone = params.mobileNumber.replace(/\D/g, '').slice(-10);

      const prefillDetails = PrefillUserLoginDetails.builder()
        .phoneNumber(cleanPhone)
        .build();

      const payRequest = StandardCheckoutPayRequest.builder()
        .merchantOrderId(params.transactionId)
        .amount(amountInPaise)
        .prefillUserLoginDetails(prefillDetails)
        .redirectUrl(params.redirectUrl)
        .message("Payment for UnHeard Session")
        .expireAfter(1200) // 20 minutes
        .build();

      console.log(`🔄 Initializing PhonePe Web Checkout... Order: ${params.transactionId}`);
      
      const response = await this.client.pay(payRequest);

      if (response && response.redirectUrl) {
        return {
          success: true,
          data: {
            instrumentResponse: {
              redirectInfo: {
                url: response.redirectUrl
              }
            }
          }
        };
      }

      console.error('❌ PhonePe SDK Error Response:', JSON.stringify(response, null, 2));
      return { success: false, message: 'Payment initiation failed via SDK' };
    } catch (error: any) {
      console.error('PhonePe SDK Init Error:', error);
      throw error;
    }
  }

  /**
   * Verify status of a V2 transaction using the official SDK
   */
  static async checkStatus(transactionId: string) {
    try {
      // The SDK uses getOrderStatus to check the state of an order
      const response = await this.client.getOrderStatus(transactionId);
      
      if (response.state === 'COMPLETED' || response.state === 'SUCCEEDED') {
        return { 
          success: true, 
          code: 'PAYMENT_SUCCESS', 
          data: { transactionId: response.orderId } 
        };
      }
      
      return { 
        success: false, 
        code: response.state, 
        message: 'Payment is not in a successful state' 
      };
    } catch (error: any) {
      console.error('PhonePe SDK Status Check Error:', error);
      throw error;
    }
  }
}
