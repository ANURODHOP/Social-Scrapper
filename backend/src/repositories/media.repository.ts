import prisma from '../prisma';
import { Prisma } from '@prisma/client';

export class MediaRepository {
  async createMedia(data: Prisma.MediaUncheckedCreateInput) {
    return prisma.media.create({ data });
  }

  async createMediaFile(data: Prisma.MediaFilesUncheckedCreateInput) {
    return prisma.mediaFiles.create({ data });
  }

  async getMediaForPost(postId: string) {
    return prisma.media.findMany({
      where: { postId },
      include: { mediaFiles: true }
    });
  }
}
