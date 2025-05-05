const instagramService = require('../services/instagram.service');

/**
 * Get Instagram authentication URL
 */
exports.getAuthUrl = (req, res) => {
  try {
    const authUrl = instagramService.getAuthUrl();
    res.json({ url: authUrl });
  } catch (error) {
    console.error('Get Instagram auth URL error:', error);
    res.status(500).json({ message: error.message || 'Failed to generate Instagram auth URL' });
  }
};

/**
 * Handle Instagram OAuth callback and connect account
 */
exports.handleCallback = async (req, res) => {
  try {
    const { code } = req.query;
    const { userId } = req.body;
    
    if (!code) {
      return res.status(400).json({ message: 'Instagram authorization code is required' });
    }
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    const result = await instagramService.connectInstagram(userId, code);
    res.json(result);
  } catch (error) {
    console.error('Instagram callback error:', error);
    res.status(500).json({ message: error.message || 'Failed to connect Instagram account' });
  }
};

/**
 * Connect Instagram account
 */
exports.connectInstagram = async (req, res) => {
  try {
    const { userId, code } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    if (!code) {
      return res.status(400).json({ message: 'Instagram authorization code is required' });
    }
    
    const result = await instagramService.connectInstagram(userId, code);
    res.json(result);
  } catch (error) {
    console.error('Connect Instagram error:', error);
    res.status(500).json({ message: error.message || 'Failed to connect Instagram account' });
  }
};

/**
 * Disconnect Instagram account
 */
exports.disconnectInstagram = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    const result = await instagramService.disconnectInstagram(userId);
    res.json(result);
  } catch (error) {
    console.error('Disconnect Instagram error:', error);
    res.status(500).json({ message: error.message || 'Failed to disconnect Instagram account' });
  }
};

/**
 * Get user Instagram feed
 */
exports.getUserFeed = async (req, res) => {
  try {
    const { username } = req.params;
    const limit = parseInt(req.query.limit) || 6;
    
    if (!username) {
      return res.status(400).json({ message: 'Instagram username is required' });
    }
    
    const feed = await instagramService.getMediaByUsername(username, limit);
    res.json(feed);
  } catch (error) {
    console.error('Get user Instagram feed error:', error);
    res.status(500).json({ message: error.message || 'Failed to get Instagram feed' });
  }
};

/**
 * Get artist Instagram feed
 */
exports.getArtistFeed = async (req, res) => {
  try {
    const { artistId } = req.params;
    const limit = parseInt(req.query.limit) || 6;
    
    if (!artistId) {
      return res.status(400).json({ message: 'Artist ID is required' });
    }
    
    const feed = await instagramService.getArtistMedia(artistId, limit);
    res.json(feed);
  } catch (error) {
    console.error('Get artist Instagram feed error:', error);
    res.status(500).json({ message: error.message || 'Failed to get artist Instagram feed' });
  }
};

/**
 * Get parlor Instagram feed
 */
exports.getParlorFeed = async (req, res) => {
  try {
    const { parlorId } = req.params;
    const limit = parseInt(req.query.limit) || 6;
    
    if (!parlorId) {
      return res.status(400).json({ message: 'Parlor ID is required' });
    }
    
    const feed = await instagramService.getParlorMedia(parlorId, limit);
    res.json(feed);
  } catch (error) {
    console.error('Get parlor Instagram feed error:', error);
    res.status(500).json({ message: error.message || 'Failed to get parlor Instagram feed' });
  }
};