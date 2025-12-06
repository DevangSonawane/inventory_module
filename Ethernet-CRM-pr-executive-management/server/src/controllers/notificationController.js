import { Op } from 'sequelize';
import User from '../models/User.js';

// Simple in-memory notification store (in production, use a database table)
// For now, we'll return empty array - can be enhanced with a Notification model later
const notifications = [];

/**
 * Get user notifications
 */
export const getNotifications = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { read, limit = 50 } = req.query;

    // Filter notifications for user
    let userNotifications = notifications.filter(n => n.userId === userId);

    if (read !== undefined) {
      userNotifications = userNotifications.filter(n => n.read === (read === 'true'));
    }

    // Sort by timestamp descending
    userNotifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Limit results
    userNotifications = userNotifications.slice(0, parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        notifications: userNotifications,
        unreadCount: notifications.filter(n => n.userId === userId && !n.read).length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark notification as read
 */
export const markNotificationRead = async (req, res, next) => {
  try {
    const { notificationId } = req.params;
    const { userId } = req.user;

    const notification = notifications.find(n => n.id === notificationId && n.userId === userId);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    notification.read = true;
    notification.readAt = new Date();

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete notification
 */
export const deleteNotification = async (req, res, next) => {
  try {
    const { notificationId } = req.params;
    const { userId } = req.user;

    const index = notifications.findIndex(n => n.id === notificationId && n.userId === userId);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    notifications.splice(index, 1);

    res.status(200).json({
      success: true,
      message: 'Notification deleted',
    });
  } catch (error) {
    next(error);
  }
};

