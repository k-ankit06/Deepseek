/**
 * Notification Controller
 * Handles FCM token registration and notification management
 */

const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorMiddleware');
const {
    sendNotification,
    sendAttendanceNotification
} = require('../services/firebaseService');

/**
 * @desc    Register FCM token for a user
 * @route   POST /api/notifications/register-token
 * @access  Private
 */
const registerFCMToken = asyncHandler(async (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({
            success: false,
            message: 'FCM token is required'
        });
    }

    // Save token to user document
    const user = await User.findById(req.user.id);

    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found'
        });
    }

    // Add token if not already present
    if (!user.fcmTokens) {
        user.fcmTokens = [];
    }

    if (!user.fcmTokens.includes(token)) {
        user.fcmTokens.push(token);
        await user.save();
    }

    console.log(`📱 FCM token registered for user: ${user.name}`);

    res.status(200).json({
        success: true,
        message: 'FCM token registered successfully'
    });
});

/**
 * @desc    Remove FCM token
 * @route   DELETE /api/notifications/remove-token
 * @access  Private
 */
const removeFCMToken = asyncHandler(async (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({
            success: false,
            message: 'FCM token is required'
        });
    }

    const user = await User.findById(req.user.id);

    if (user && user.fcmTokens) {
        user.fcmTokens = user.fcmTokens.filter(t => t !== token);
        await user.save();
    }

    res.status(200).json({
        success: true,
        message: 'FCM token removed successfully'
    });
});

/**
 * @desc    Send test notification
 * @route   POST /api/notifications/test
 * @access  Private/Admin
 */
const sendTestNotification = asyncHandler(async (req, res) => {
    const { token, title, body } = req.body;

    if (!token) {
        return res.status(400).json({
            success: false,
            message: 'FCM token is required'
        });
    }

    const result = await sendNotification(
        token,
        title || 'Test Notification',
        body || 'This is a test notification from Smart Attendance System',
        { type: 'test' }
    );

    if (result.success) {
        res.status(200).json({
            success: true,
            message: 'Test notification sent successfully',
            messageId: result.messageId
        });
    } else {
        res.status(500).json({
            success: false,
            message: 'Failed to send notification',
            error: result.error
        });
    }
});

/**
 * @desc    Get notification settings
 * @route   GET /api/notifications/settings
 * @access  Private
 */
const getNotificationSettings = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id).select('notificationSettings fcmTokens');

    res.status(200).json({
        success: true,
        data: {
            settings: user.notificationSettings || {
                attendanceAlerts: true,
                dailySummary: true,
                absentAlerts: true
            },
            tokensRegistered: user.fcmTokens?.length || 0
        }
    });
});

/**
 * @desc    Update notification settings
 * @route   PUT /api/notifications/settings
 * @access  Private
 */
const updateNotificationSettings = asyncHandler(async (req, res) => {
    const { attendanceAlerts, dailySummary, absentAlerts } = req.body;

    const user = await User.findById(req.user.id);

    if (!user.notificationSettings) {
        user.notificationSettings = {};
    }

    if (attendanceAlerts !== undefined) {
        user.notificationSettings.attendanceAlerts = attendanceAlerts;
    }
    if (dailySummary !== undefined) {
        user.notificationSettings.dailySummary = dailySummary;
    }
    if (absentAlerts !== undefined) {
        user.notificationSettings.absentAlerts = absentAlerts;
    }

    await user.save();

    res.status(200).json({
        success: true,
        message: 'Notification settings updated',
        data: user.notificationSettings
    });
});

module.exports = {
    registerFCMToken,
    removeFCMToken,
    sendTestNotification,
    getNotificationSettings,
    updateNotificationSettings
};
