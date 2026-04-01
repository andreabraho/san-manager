const mongoose = require('mongoose');
const Location = require('../models/Location');
const { Provider } = require('../models/User');

// Own + accepted-shared locations
const getLocations = async (req, res, next) => {
  try {
    const ownLocations = await Location.find({ provider: req.user._id })
      .populate('sharedWith.provider', 'username displayName')
      .lean();
    const sharedLocations = await Location.find({
      sharedWith: { $elemMatch: { provider: req.user._id, status: 'accepted' } },
    })
      .populate('provider', 'username displayName')
      .lean();

    const own = ownLocations.map((l) => ({ ...l, isOwner: true }));
    const shared = sharedLocations.map((l) => ({ ...l, isOwner: false }));
    res.json([...own, ...shared]);
  } catch (err) {
    next(err);
  }
};

const createLocation = async (req, res, next) => {
  try {
    const { name, address, city, description } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ message: 'name is required' });
    }
    if (!address || typeof address !== 'string' || !address.trim()) {
      return res.status(400).json({ message: 'address is required' });
    }
    if (!city || typeof city !== 'string' || !city.trim()) {
      return res.status(400).json({ message: 'city is required' });
    }
    const location = await Location.create({
      provider: req.user._id,
      name: name.trim(),
      address: address.trim(),
      city: city.trim(),
      description: description ? String(description).trim() : '',
    });
    res.status(201).json(location);
  } catch (err) {
    next(err);
  }
};

const updateLocation = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid location id' });
    }

    // Whitelist fields — prevent overwriting provider or sharedWith via body
    const { name, address, city, description, isActive } = req.body;
    const update = {};
    if (name !== undefined) {
      if (typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ message: 'name must be a non-empty string' });
      }
      update.name = name.trim();
    }
    if (address !== undefined) update.address = String(address).trim();
    if (city !== undefined) update.city = String(city).trim();
    if (description !== undefined) update.description = String(description).trim();
    if (isActive !== undefined) update.isActive = !!isActive;

    const location = await Location.findOneAndUpdate(
      { _id: req.params.id, provider: req.user._id },
      update,
      { new: true }
    );
    if (!location) return res.status(404).json({ message: 'Location not found' });
    res.json(location);
  } catch (err) {
    next(err);
  }
};

const deleteLocation = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid location id' });
    }
    const deleted = await Location.findOneAndDelete({ _id: req.params.id, provider: req.user._id });
    if (!deleted) return res.status(404).json({ message: 'Location not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
};

// Owner invites another provider by username
const shareLocation = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid location id' });
    }

    const location = await Location.findOne({ _id: req.params.id, provider: req.user._id });
    if (!location) return res.status(404).json({ message: 'Location not found' });

    const { username } = req.body;
    if (!username || typeof username !== 'string' || !username.trim()) {
      return res.status(400).json({ message: 'username is required' });
    }

    const invitee = await Provider.findOne({ username: username.trim().toLowerCase() }).lean();
    if (!invitee) return res.status(404).json({ message: 'Provider not found' });
    if (invitee._id.equals(req.user._id)) {
      return res.status(400).json({ message: 'Cannot share with yourself' });
    }

    const already = location.sharedWith.find((s) => s.provider.equals(invitee._id));
    if (already) return res.status(409).json({ message: 'Already shared with this provider' });

    location.sharedWith.push({ provider: invitee._id, status: 'pending' });
    await location.save();
    const populated = await location.populate('sharedWith.provider', 'username displayName');
    res.json(populated);
  } catch (err) {
    next(err);
  }
};

// Owner removes a shared provider
const removeShare = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid location id' });
    }
    if (!mongoose.isValidObjectId(req.params.providerId)) {
      return res.status(400).json({ message: 'Invalid providerId' });
    }

    const location = await Location.findOne({ _id: req.params.id, provider: req.user._id });
    if (!location) return res.status(404).json({ message: 'Location not found' });

    location.sharedWith = location.sharedWith.filter(
      (s) => !s.provider.equals(req.params.providerId)
    );
    await location.save();
    res.json({ message: 'Share removed' });
  } catch (err) {
    next(err);
  }
};

// Invited provider gets their pending invitations
const getShareInvites = async (req, res, next) => {
  try {
    const locations = await Location.find({
      sharedWith: { $elemMatch: { provider: req.user._id, status: 'pending' } },
    })
      .populate('provider', 'username displayName')
      .lean();
    res.json(locations);
  } catch (err) {
    next(err);
  }
};

// Invited provider accepts or rejects
const respondToShare = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid location id' });
    }

    const { response } = req.body;
    if (!['accepted', 'rejected'].includes(response)) {
      return res.status(400).json({ message: 'response must be accepted or rejected' });
    }

    const location = await Location.findOne({
      _id: req.params.id,
      sharedWith: { $elemMatch: { provider: req.user._id } },
    });
    if (!location) return res.status(404).json({ message: 'Invite not found' });

    const entry = location.sharedWith.find((s) => s.provider.equals(req.user._id));
    entry.status = response;
    await location.save();
    res.json({ message: response });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getLocations,
  createLocation,
  updateLocation,
  deleteLocation,
  shareLocation,
  removeShare,
  getShareInvites,
  respondToShare,
};
