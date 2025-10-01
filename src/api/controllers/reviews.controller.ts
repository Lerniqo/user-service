import { Request, Response } from 'express';
import prisma from '../../config/prisma';
import { AuthenticatedRequest } from '../../types';

// POST /reviews/teachers/:id/reviews
export const createTeacherReview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id: teacherId } = req.params;
    const { rating, comment, isAnonymous = false } = req.body;
    const { userId: studentUserId, role } = req.user;

    // Only students can create reviews
    if (role !== 'Student') {
      res.status(403).json({ message: 'Only students can create teacher reviews.' });
      return;
    }

    // Validate rating (1-5)
    if (!rating || rating < 1 || rating > 5) {
      res.status(400).json({ message: 'Rating must be between 1 and 5.' });
      return;
    }

    // Check if teacher exists
    const teacher = await prisma.user.findUnique({
      where: { 
        id: teacherId,
        role: 'Teacher',
        isActive: true,
        isVerified: true
      },
      include: { teacher: true }
    });

    if (!teacher || !teacher.teacher) {
      res.status(404).json({ message: 'Teacher not found.' });
      return;
    }

    // Get student profile
    const student = await prisma.user.findUnique({
      where: { id: studentUserId },
      include: { student: true }
    });

    if (!student || !student.student) {
      res.status(404).json({ message: 'Student profile not found.' });
      return;
    }

    // Check if student already reviewed this teacher
    const existingReview = await (prisma as any).teacherReview.findUnique({
      where: {
        one_review_per_student_teacher: {
          teacherId: teacher.teacher.id,
          studentId: student.student.id
        }
      }
    });

    if (existingReview) {
      res.status(400).json({ message: 'You have already reviewed this teacher.' });
      return;
    }

    // Create the review
    const review = await (prisma as any).teacherReview.create({
      data: {
        teacherId: teacher.teacher.id,
        studentId: student.student.id,
        rating: parseInt(rating),
        comment: comment?.trim() || null,
        isAnonymous: Boolean(isAnonymous)
      }
    });

    // Return created review
    const reviewResponse = {
      id: review.id,
      teacherId: review.teacherId,
      studentId: review.studentId,
      rating: review.rating,
      comment: review.comment,
      isAnonymous: review.isAnonymous,
      studentName: review.isAnonymous ? undefined : student.fullName,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt
    };

    res.status(201).json({
      message: 'Review created successfully.',
      success: true,
      data: { review: reviewResponse }
    });
  } catch (error) {
    console.error('createTeacherReview error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// GET /reviews/teachers/:id/reviews
export const getTeacherReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: teacherId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
    const skip = (page - 1) * limit;

    // Check if teacher exists
    const teacher = await prisma.user.findUnique({
      where: { 
        id: teacherId,
        role: 'Teacher',
        isActive: true,
        isVerified: true
      },
      include: { teacher: true }
    });

    if (!teacher || !teacher.teacher) {
      res.status(404).json({ message: 'Teacher not found.' });
      return;
    }

    // Get reviews with student information
    const reviews = await (prisma as any).teacherReview.findMany({
      where: {
        teacherId: teacher.teacher.id,
        isActive: true
      },
      include: {
        student: {
          include: {
            user: {
              select: {
                fullName: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    });

    // Calculate review statistics
    const allReviews = await (prisma as any).teacherReview.findMany({
      where: {
        teacherId: teacher.teacher.id,
        isActive: true
      },
      select: { rating: true }
    });

    const totalReviews = allReviews.length;
    const averageRating = totalReviews > 0 
      ? allReviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
      : 0;

    const ratingDistribution = {
      1: allReviews.filter(r => r.rating === 1).length,
      2: allReviews.filter(r => r.rating === 2).length,
      3: allReviews.filter(r => r.rating === 3).length,
      4: allReviews.filter(r => r.rating === 4).length,
      5: allReviews.filter(r => r.rating === 5).length,
    };

    // Format reviews
    const formattedReviews = reviews.map(review => ({
      id: review.id,
      teacherId: review.teacherId,
      studentId: review.studentId,
      rating: review.rating,
      comment: review.comment,
      isAnonymous: review.isAnonymous,
      studentName: review.isAnonymous ? undefined : review.student.user.fullName,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt
    }));

    const reviewStats = {
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      totalReviews,
      ratingDistribution
    };

    res.status(200).json({
      message: 'Reviews retrieved successfully.',
      success: true,
      data: {
        reviews: formattedReviews,
        reviewStats,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalReviews / limit),
          totalItems: totalReviews,
          itemsPerPage: limit
        }
      }
    });
  } catch (error) {
    console.error('getTeacherReviews error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// PUT /reviews/:id
export const updateTeacherReview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id: reviewId } = req.params;
    const { rating, comment, isAnonymous } = req.body;
    const { userId: studentUserId, role } = req.user;

    // Only students can update reviews
    if (role !== 'Student') {
      res.status(403).json({ message: 'Only students can update reviews.' });
      return;
    }

    // Get student profile
    const student = await prisma.user.findUnique({
      where: { id: studentUserId },
      include: { student: true }
    });

    if (!student || !student.student) {
      res.status(404).json({ message: 'Student profile not found.' });
      return;
    }

    // Find the review and check ownership
    const existingReview = await (prisma as any).teacherReview.findUnique({
      where: { id: reviewId },
      include: {
        student: {
          include: {
            user: {
              select: { fullName: true }
            }
          }
        }
      }
    });

    if (!existingReview) {
      res.status(404).json({ message: 'Review not found.' });
      return;
    }

    if (existingReview.studentId !== student.student.id) {
      res.status(403).json({ message: 'You can only update your own reviews.' });
      return;
    }

    // Validate rating if provided
    if (rating && (rating < 1 || rating > 5)) {
      res.status(400).json({ message: 'Rating must be between 1 and 5.' });
      return;
    }

    // Update the review
    const updateData: any = {};
    if (rating !== undefined) updateData.rating = parseInt(rating);
    if (comment !== undefined) updateData.comment = comment?.trim() || null;
    if (isAnonymous !== undefined) updateData.isAnonymous = Boolean(isAnonymous);
    updateData.updatedAt = new Date();

    const updatedReview = await (prisma as any).teacherReview.update({
      where: { id: reviewId },
      data: updateData
    });

    // Return updated review
    const reviewResponse = {
      id: updatedReview.id,
      teacherId: updatedReview.teacherId,
      studentId: updatedReview.studentId,
      rating: updatedReview.rating,
      comment: updatedReview.comment,
      isAnonymous: updatedReview.isAnonymous,
      studentName: updatedReview.isAnonymous ? undefined : existingReview.student.user.fullName,
      createdAt: updatedReview.createdAt,
      updatedAt: updatedReview.updatedAt
    };

    res.status(200).json({
      message: 'Review updated successfully.',
      success: true,
      data: { review: reviewResponse }
    });
  } catch (error) {
    console.error('updateTeacherReview error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// DELETE /reviews/:id
export const deleteTeacherReview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id: reviewId } = req.params;
    const { userId: studentUserId, role } = req.user;

    // Only students and admins can delete reviews
    if (role !== 'Student' && role !== 'Admin') {
      res.status(403).json({ message: 'Only students can delete their own reviews or admins can delete any review.' });
      return;
    }

    // Find the review
    const existingReview = await (prisma as any).teacherReview.findUnique({
      where: { id: reviewId }
    });

    if (!existingReview) {
      res.status(404).json({ message: 'Review not found.' });
      return;
    }

    // Check ownership for students
    if (role === 'Student') {
      const student = await prisma.user.findUnique({
        where: { id: studentUserId },
        include: { student: true }
      });

      if (!student || !student.student || existingReview.studentId !== student.student.id) {
        res.status(403).json({ message: 'You can only delete your own reviews.' });
        return;
      }
    }

    // Soft delete the review (set isActive to false)
    await (prisma as any).teacherReview.update({
      where: { id: reviewId },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    });

    res.status(200).json({
      message: 'Review deleted successfully.',
      success: true
    });
  } catch (error) {
    console.error('deleteTeacherReview error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};