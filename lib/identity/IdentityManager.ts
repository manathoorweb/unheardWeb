import { createAdminClient } from '@/utils/supabase/server';

export interface UserIdentity {
  id: string;
  user_id?: string;
  phones: string[];
  fingerprints: string[];
  used_coupons: string[];
  is_trial_claimed: boolean;
}

export class IdentityManager {
  /**
   * Resolves a user's identity based on phone and/or fingerprint.
   * Merges identities if a link is discovered.
   */
  static async resolveIdentity(phone?: string, fingerprint?: string, userId?: string): Promise<UserIdentity | null> {
    const supabase = await createAdminClient();
    
    // 1. Search for matches
    const query = supabase.from('identity_trails').select('*');
    
    const conditions: string[] = [];
    if (phone) conditions.push(`phones.cs.["${phone}"]`);
    if (fingerprint) conditions.push(`fingerprints.cs.["${fingerprint}"]`);
    if (userId) conditions.push(`user_id.eq.${userId}`);
    
    if (conditions.length === 0) return null;
    
    const { data: matches, error } = await query.or(conditions.join(','));
    
    if (error) {
      console.error('Identity Resolution Error:', error);
      return null;
    }

    let identity: UserIdentity;

    if (!matches || matches.length === 0) {
      // Create new identity
      const { data: newIdentity, error: createError } = await supabase
        .from('identity_trails')
        .insert({
          user_id: userId,
          phones: phone ? [phone] : [],
          fingerprints: fingerprint ? [fingerprint] : [],
          used_coupons: [],
          is_trial_claimed: false
        })
        .select()
        .single();

      if (createError) throw createError;
      identity = newIdentity as UserIdentity;
    } else {
      // Resolve & Merge if multiple rows found
      const mergedPhones = new Set<string>();
      const mergedFingerprints = new Set<string>();
      const mergedCoupons = new Set<string>();
      let isTrialClaimed = false;
      const primaryId = matches[0].id;
      const targetUserId = userId || matches[0].user_id;

      matches.forEach(m => {
        (m.phones || []).forEach((p: string) => mergedPhones.add(p));
        (m.fingerprints || []).forEach((f: string) => mergedFingerprints.add(f));
        (m.used_coupons || []).forEach((c: string) => mergedCoupons.add(c));
        if (m.is_trial_claimed) isTrialClaimed = true;
      });

      // Add current inputs
      if (phone) mergedPhones.add(phone);
      if (fingerprint) mergedFingerprints.add(fingerprint);

      // Update the first match and delete others (merging)
      const { data: updated, error: updateError } = await supabase
        .from('identity_trails')
        .update({
          user_id: targetUserId,
          phones: Array.from(mergedPhones),
          fingerprints: Array.from(mergedFingerprints),
          used_coupons: Array.from(mergedCoupons),
          is_trial_claimed: isTrialClaimed,
          updated_at: new Date().toISOString()
        })
        .eq('id', primaryId)
        .select()
        .single();

      if (updateError) throw updateError;

      // Delete the other merged rows
      if (matches.length > 1) {
        const otherIds = matches.slice(1).map(m => m.id);
        await supabase.from('identity_trails').delete().in('id', otherIds);
      }

      identity = updated as UserIdentity;
    }

    return identity;
  }

  /**
   * Records a coupon usage for an identity.
   */
  static async claimCoupon(identityId: string, couponCode: string, isTrial: boolean = false) {
    const supabase = await createAdminClient();
    
    const { data: identity } = await supabase
      .from('identity_trails')
      .select('used_coupons, is_trial_claimed')
      .eq('id', identityId)
      .single();

    if (!identity) return;

    const usedCoupons = new Set(identity.used_coupons || []);
    usedCoupons.add(couponCode);

    await supabase
      .from('identity_trails')
      .update({
        used_coupons: Array.from(usedCoupons),
        is_trial_claimed: identity.is_trial_claimed || isTrial,
        updated_at: new Date().toISOString()
      })
      .eq('id', identityId);
  }
}
