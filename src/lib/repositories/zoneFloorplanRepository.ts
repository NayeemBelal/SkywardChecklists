import { supabase } from '@/lib/supabase';
import { ZoneFloorplan } from '@/types';

export class ZoneFloorplanRepository {
  private bucketName = 'site-floorplans';

  async findByZoneId(zoneId: number): Promise<ZoneFloorplan[]> {
    const { data, error } = await supabase
      .from('zone_floorplans')
      .select('*')
      .eq('zone_id', zoneId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async create(zoneId: number, imagePath: string): Promise<ZoneFloorplan> {
    const { data, error } = await supabase
      .from('zone_floorplans')
      .insert([{
        zone_id: zoneId,
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
      .from('zone_floorplans')
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
      .from('zone_floorplans')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;
  }

  async uploadImage(fileBuffer: Buffer, originalFilename: string, mimeType: string, zoneId: number): Promise<string> {
    // Generate unique file name
    const fileExt = originalFilename.split('.').pop();
    const fileName = `zones/${zoneId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

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
