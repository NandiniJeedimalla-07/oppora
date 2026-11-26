import Post from '../models/Post.js';
import Application from '../models/Application.js';
import Registration from '../models/Registration.js';
import User from '../models/User.js';
import fs from 'fs/promises';
import path from 'path';
import { getResumeUploadDirectory } from '../middleware/uploadMiddleware.js';
import { isStudentEligible } from '../services/eligibilityService.js';

export const getStudentDashboard = async (req, res) => {
  try {
    const student = req.user;

    // Fetch all non-archived published posts
    const allPosts = await Post.find({
      status: 'PUBLISHED',
      isArchived: false,
    }).sort({ deadline: 1, createdAt: -1 });

    // Fetch student's existing applications and registrations
    const userApps = await Application.find({ studentId: student._id });
    const userRegs = await Registration.find({ studentId: student._id });

    const appliedPostIds = new Set(userApps.map((a) => a.postId.toString()));
    const registeredPostIds = new Set(userRegs.map((r) => r.postId.toString()));

    let activeJobPosts = 0;
    let activeHackathons = 0;
    let activeMandatory = 0;
    let pendingApplicationsCount = 0;

    const actionRequiredList = [];

    for (let post of allPosts) {
      const pObj = post.toObject({ virtuals: true });
      const isEligible = isStudentEligible(student, pObj.eligibility);

      if (!isEligible && pObj.category !== 'INTERVIEW_EXPERIENCE') {
        continue;
      }

      const isExpired = pObj.calculatedStatus === 'EXPIRED';

      if (pObj.category === 'JOB') {
        if (!isExpired) activeJobPosts++;
        const hasApplied = appliedPostIds.has(pObj._id.toString());
        if (!hasApplied) {
          if (!isExpired) pendingApplicationsCount++;
          actionRequiredList.push({
            ...pObj,
            studentStatus: 'NOT APPLIED',
            urgency: pObj.calculatedStatus === 'EXPIRING SOON' ? 1 : 2,
          });
        }
      } else if (pObj.category === 'HACKATHON') {
        if (!isExpired) activeHackathons++;
        const hasRegistered = registeredPostIds.has(pObj._id.toString());
        if (!hasRegistered) {
          if (!isExpired) pendingApplicationsCount++;
          actionRequiredList.push({
            ...pObj,
            studentStatus: 'NOT REGISTERED',
            urgency: pObj.calculatedStatus === 'EXPIRING SOON' ? 1 : 2,
          });
        }
      } else if (pObj.category === 'MANDATORY_REGISTRATION') {
        if (!isExpired) activeMandatory++;
        const hasRegistered = registeredPostIds.has(pObj._id.toString());
        if (!hasRegistered) {
          if (!isExpired) pendingApplicationsCount++;
          actionRequiredList.push({
            ...pObj,
            studentStatus: 'NOT REGISTERED',
            urgency: 0, // Top priority for mandatory
          });
        }
      }
    }

    // Sort Action Required: Mandatory first, then EXPIRING SOON, then closest deadline
    actionRequiredList.sort((a, b) => {
      if (a.urgency !== b.urgency) return a.urgency - b.urgency;
      const dateA = a.deadline ? new Date(a.deadline).getTime() : Infinity;
      const dateB = b.deadline ? new Date(b.deadline).getTime() : Infinity;
      return dateA - dateB;
    });

    res.json({
      student: {
        name: student.name,
        email: student.email,
        personalEmail: student.personalEmail,
        contactNumber: student.contactNumber,
        resumeUrl: student.resumeUrl,
        rollNumber: student.rollNumber,
        department: student.department,
        graduationYear: student.graduationYear,
        cgpa: student.cgpa,
        backlogs: student.backlogs,
      },
      counts: {
        activeJobPosts,
        activeHackathons,
        activeMandatory,
        pendingApplications: pendingApplicationsCount,
      },
      actionRequired: actionRequiredList,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const applyToJob = async (req, res) => {
  try {
    const { postId } = req.body;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }

    if (post.category !== 'JOB') {
      return res.status(400).json({ message: 'Application is only for Job postings' });
    }

    const application = await Application.create({
      studentId: req.user._id,
      postId: post._id,
      status: 'APPLIED',
      appliedAt: new Date(),
    });

    res.status(201).json({ message: 'Successfully marked as APPLIED', application });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You have already marked yourself as APPLIED for this job.' });
    }
    res.status(500).json({ message: error.message });
  }
};

export const unapplyFromJob = async (req, res) => {
  try {
    const { postId } = req.body;
    const deleted = await Application.findOneAndDelete({
      studentId: req.user._id,
      postId,
    });

    if (!deleted) {
      return res.status(404).json({ message: 'Application record not found to unmark.' });
    }

    res.json({ message: 'Successfully unmarked application. Post reverted to NOT APPLIED.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const registerForEvent = async (req, res) => {
  try {
    const { postId } = req.body;

    if (!postId) {
      return res.status(400).json({ message: 'Post ID is required' });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }

    // Allow registration only for these categories
    if (
      post.category !== 'HACKATHON' &&
      post.category !== 'MANDATORY_REGISTRATION'
    ) {
      return res.status(400).json({
        message: 'Registration is for Hackathons and Mandatory Registrations only',
      });
    }

    // Only published opportunities can be registered for
    if (post.status !== 'PUBLISHED' || post.isArchived) {
      return res.status(400).json({
        message: 'This opportunity is not available for registration',
      });
    }

    // Check deadline
    if (post.deadline && new Date(post.deadline) < new Date()) {
      return res.status(400).json({
        message: 'Registration deadline has passed',
      });
    }

    // Check student eligibility
    if (!isStudentEligible(req.user, post.eligibility)) {
      return res.status(403).json({
        message: 'You are not eligible for this opportunity',
      });
    }

    const registration = await Registration.create({
      studentId: req.user._id,
      postId: post._id,
      status: 'REGISTERED',
      registeredAt: new Date(),
    });

    return res.status(201).json({
      message: 'Successfully marked as REGISTERED',
      registration,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'You have already marked yourself as REGISTERED for this event.',
      });
    }

    return res.status(500).json({ message: error.message });
  }
};

export const unregisterFromEvent = async (req, res) => {
  try {
    const { postId } = req.body;

    if (!postId) {
      return res.status(400).json({
        message: 'Post ID is required',
      });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        message: 'Opportunity not found',
      });
    }

    // Only hackathons and mandatory registrations
    if (
      post.category !== 'HACKATHON' &&
      post.category !== 'MANDATORY_REGISTRATION'
    ) {
      return res.status(400).json({
        message: 'Only hackathon and mandatory registrations can be unmarked here',
      });
    }

    const deleted = await Registration.findOneAndDelete({
      studentId: req.user._id,
      postId: post._id,
    });

    if (!deleted) {
      return res.status(404).json({
        message: 'Registration record not found to unmark.',
      });
    }

    return res.json({
      message: 'Successfully unmarked registration. Post reverted to NOT REGISTERED.',
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ studentId: req.user._id })
      .populate('postId')
      .sort({ appliedAt: -1 });

    const result = applications
      .filter((app) => app.postId && !app.postId.isArchived)
      .map((app) => {
        const postObj = app.postId.toObject({ virtuals: true });
        postObj.studentStatus = 'APPLIED';
        return {
          _id: app._id,
          appliedAt: app.appliedAt,
          post: postObj,
        };
      });

    res.json({ applications: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({
      studentId: req.user._id,
    })
      .populate({
        path: 'postId',
        match: {
          category: {
            $in: ['HACKATHON', 'MANDATORY_REGISTRATION'],
          },
          isArchived: false,
        },
      })
      .sort({ registeredAt: -1 });

    const result = registrations
      .filter((reg) => reg.postId)
      .map((reg) => {
        const postObj = reg.postId.toObject({ virtuals: true });
        postObj.studentStatus = 'REGISTERED';

        return {
          _id: reg._id,
          registeredAt: reg.registeredAt,
          post: postObj,
        };
      });

    res.json({ registrations: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please select a resume file to upload.' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    const previousResumeUrl = user.resumeUrl;
    const resumeUrl = `/uploads/resumes/${req.file.filename}`;

    user.resumeUrl = resumeUrl;
    await user.save();

    // Remove the previous locally stored resume after the new one is saved.
    if (previousResumeUrl && previousResumeUrl.startsWith('/uploads/resumes/')) {
      const previousFilename = path.basename(previousResumeUrl);
      const previousPath = path.join(getResumeUploadDirectory(), previousFilename);
      try {
        await fs.unlink(previousPath);
      } catch (error) {
        if (error.code !== 'ENOENT') {
          console.warn('Could not remove previous resume:', error.message);
        }
      }
    }

    res.status(201).json({
      message: 'Resume uploaded successfully.',
      resumeUrl: user.resumeUrl,
      user,
    });
  } catch (error) {
    // If the database update fails, do not leave an orphaned uploaded file behind.
    if (req.file?.path) {
      try {
        await fs.unlink(req.file.path);
      } catch (_) {
        // Ignore cleanup errors.
      }
    }
    res.status(500).json({ message: error.message });
  }
};


export const updateProfile = async (req, res) => {
  try {
    const {
      name,
      department,
      graduationYear,
      cgpa,
      backlogs,
      rollNumber,
      personalEmail,
      contactNumber,
    } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: 'Student not found',
      });
    }

    // Validate name
    if (name !== undefined) {
      if (typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({
          message: 'Name cannot be empty',
        });
      }
      user.name = name.trim();
    }

    // Validate department
    if (department !== undefined) {
      const allowedDepartments = [
        'CSE', 'IT', 'ECE', 'EEE', 'MECH',
        'CIVIL', 'AIDS', 'AIML', 'OTHER',
      ];

      if (!allowedDepartments.includes(department)) {
        return res.status(400).json({
          message: 'Invalid department',
        });
      }

      user.department = department;
    }

    // Validate graduation year
    if (graduationYear !== undefined) {
      const year = Number(graduationYear);

      if (!Number.isInteger(year) || year < 2000 || year > 2100) {
        return res.status(400).json({
          message: 'Invalid graduation year',
        });
      }

      user.graduationYear = year;
    }

    // Validate CGPA
    if (cgpa !== undefined) {
      const value = Number(cgpa);

      if (!Number.isFinite(value) || value < 0 || value > 10) {
        return res.status(400).json({
          message: 'CGPA must be between 0 and 10',
        });
      }

      user.cgpa = value;
    }

    // Validate backlogs
    if (backlogs !== undefined) {
      const value = Number(backlogs);

      if (!Number.isInteger(value) || value < 0) {
        return res.status(400).json({
          message: 'Backlogs must be a non-negative integer',
        });
      }

      user.backlogs = value;
    }

    // Validate roll number
    if (rollNumber !== undefined) {
      if (typeof rollNumber !== 'string' || !rollNumber.trim()) {
        return res.status(400).json({
          message: 'Roll number cannot be empty',
        });
      }

      user.rollNumber = rollNumber.trim();
    }

    // Validate personal email
    if (personalEmail !== undefined) {
      if (
        typeof personalEmail !== 'string' ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personalEmail.trim())
      ) {
        return res.status(400).json({
          message: 'Invalid personal email',
        });
      }

      user.personalEmail = personalEmail.trim().toLowerCase();
    }

    // Validate contact number
    if (contactNumber !== undefined) {
      if (
        typeof contactNumber !== 'string' ||
        !/^\+?[0-9]{10,15}$/.test(contactNumber.trim())
      ) {
        return res.status(400).json({
          message: 'Invalid contact number',
        });
      }

      user.contactNumber = contactNumber.trim();
    }

    // Save with schema validation
    await user.save();

    // Return only permitted profile information
    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        personalEmail: user.personalEmail,
        contactNumber: user.contactNumber,
        resumeUrl: user.resumeUrl,
        rollNumber: user.rollNumber,
        department: user.department,
        graduationYear: user.graduationYear,
        cgpa: user.cgpa,
        backlogs: user.backlogs,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

