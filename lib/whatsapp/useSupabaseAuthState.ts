import { proto, initAuthCreds, BufferJSON, AuthenticationState } from '@whiskeysockets/baileys';
import { createAdminClient } from '../supabase/admin';

export const useSupabaseAuthState = async (): Promise<{ state: AuthenticationState, saveCreds: () => Promise<void> }> => {
  const supabase = await createAdminClient();

  // Helper to read data from the DB
  const readData = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('whatsapp_auth')
        .select('data')
        .eq('id', id)
        .single();

      if (error || !data) return null;
      return JSON.parse(JSON.stringify(data.data), BufferJSON.reviver);
    } catch {
      return null;
    }
  };

  // Helper to append/write data safely to DB
  const writeData = async (data: any, id: string) => {
    try {
      await supabase.from('whatsapp_auth').upsert({
        id,
        data: JSON.parse(JSON.stringify(data, BufferJSON.replacer)),
        updated_at: new Date().toISOString()
      });
    } catch (err) {
      console.error('Baileys Supabase Write Error:', err);
    }
  };

  const removeData = async (id: string) => {
    await supabase.from('whatsapp_auth').delete().eq('id', id);
  };

  // Initialize standard creds or grab from DB
  const credsData = await readData('creds');
  const creds = credsData || initAuthCreds();

  return {
    state: {
      creds,
      keys: {
        get: async (type, ids) => {
          const data: { [_: string]: any } = {};
          await Promise.all(
            ids.map(async id => {
              let value = await readData(`${type}-${id}`);
              if (type === 'app-state-sync-key' && value) {
                value = proto.Message.AppStateSyncKeyData.fromObject(value);
              }
              data[id] = value;
            })
          );
          return data;
        },
        set: async (data) => {
          const tasks: Promise<void>[] = [];
          for (const category in data) {
            for (const id in data[category as keyof typeof data]) {
              const value = data[category as keyof typeof data]![id];
              const key = `${category}-${id}`;
              if (value) {
                tasks.push(writeData(value, key));
              } else {
                tasks.push(removeData(key));
              }
            }
          }
          await Promise.all(tasks);
        }
      }
    },
    saveCreds: () => {
      return writeData(creds, 'creds');
    }
  };
};
