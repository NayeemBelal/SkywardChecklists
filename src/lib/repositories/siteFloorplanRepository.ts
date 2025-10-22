import { supabase } from '@/lib/supabase';
import { SiteFloorplan } from '@/types';

export class SiteFloorplanRepository {
  private bucketName = 'site-floorplans';

  async findBySiteId(siteId: number): Promise<SiteFloorplan[]> {
    const { data, error } = await supabase
      .from('site_floorplans')
      .select('*')
      .eq('site_id', siteId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async create(siteId: number, imagePath: string): Promise<SiteFloorplan> {
    const { data, error } = await supabase
      .from('site_floorplans')
      .insert([{
        site_id: siteId,
        image_path: imagePath,
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async delete(id: number): Promise<void> {
    // First get the floorplan to retrieve the image path
    const { data: floorplan, error: fetchError } = await supabase
      .from('site_floorplans')
      .select('image_path')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;
    if (!floorplan) throw new Error('Floorplan not found');

    // Delete the image from storage
    const { error: storageError } = await supabase.storage
      .from(this.bucketName)
      .remove([floorplan.image_path]);

    if (storageError) {
      console.error('Error deleting from storage:', storageError);
      // Continue with DB deletion even if storage deletion fails
    }

    // Delete the database record
    const { error: deleteError } = await supabase
      .from('site_floorplans')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;
  }

  async uploadImage(fileBuffer: Buffer, originalFilename: string, mimeType: string, siteId: number): Promise<string> {
    // Generate unique file name
    const fileExt = originalFilename.split('.').pop();
    const fileName = `${siteId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

    // Upload to Supabase storage
    const { error: uploadError } = await supabase.storage
      .from(this.bucketName)
      .upload(fileName, fileBuffer, {
        cacheControl: '3600',
        upsert: false,
        contentType: mimeType
      });

    if (uploadError) throw uploadError;

    return fileName;
  }

  getPublicUrl(imagePath: string): string {
    const { data } = supabase.storage
      .from(this.bucketName)
      .getPublicUrl(imagePath);

    return data.publicUrl;
  }
}
