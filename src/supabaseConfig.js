import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
// Switch back to anon key for security
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

export const uploadReceiptImage = async (file, receiptId) => {
  try {
    const fileExt = file.name.split('.').pop();
    // Add a unique identifier to prevent collisions
    const fileName = `receipts/${receiptId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    // Use upsert to handle existing files
    const { data, error } = await supabase.storage
      .from('receipt-images')
      .upload(fileName, file, {
        upsert: true,
        cacheControl: '3600'
      });

    if (error) throw error;

    // Get public URL
    const { data: publicUrl } = supabase.storage
      .from('receipt-images')
      .getPublicUrl(fileName);

    return publicUrl.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

export const getReceiptImages = async (receiptId) => {
  try {
    const { data, error } = await supabase.storage
      .from('receipt-images')
      .list(`receipts/${receiptId}`);

    if (error) throw error;

    if (!data) return [];

    return data.map(file => ({
      name: file.name,
      url: supabase.storage
        .from('receipt-images')
        .getPublicUrl(`receipts/${receiptId}/${file.name}`).data.publicUrl,
      created: file.created_at,
      size: file.metadata.size
    }));
  } catch (error) {
    console.error('Error fetching images:', error);
    throw error;
  }
};

export const deleteReceiptImage = async (receiptId, fileName) => {
  try {
    const { error } = await supabase.storage
      .from('receipt-images')
      .remove([`receipts/${receiptId}/${fileName}`]);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
}; 