import { BadRequestException } from '@nestjs/common';

export function validatePublishRequirements(post) {
  const requiredForPublish = [
    'title',
    'slug',
    'status',
    'content',
    'featuredImageUrl',
    'featuredImageAlt',
    'categories',
    'tags',
    'contributors',
    'description',
  ];

  const missingFields = requiredForPublish.filter(
    (field) =>
      post[field] === undefined ||
      post[field] === null ||
      post[field] === '' ||
      (Array.isArray(post[field]) && post[field].length === 0),
  );

  if (missingFields.length > 0) {
    throw new BadRequestException(
      `Missing required fields for publishing: ${missingFields.join(', ')}`,
    );
  }
}
