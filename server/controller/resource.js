import ResourceModel from '../models/resourceSchema.js';

const createResource = async (req, res) => {
    try {
        const { title, description, url, subject, visibility, audience } = req.body;
        const createdBy = req.user._id;

        if (!title || !url) {
            return res.status(400).json({ status: false, message: "Title and URL are required" });
        }

        const resource = new ResourceModel({ title, description, url, subject, visibility, audience, createdBy });
        await resource.save();
        return res.status(201).json({ status: true, message: "Resource created", resource });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error" });
    }
};

const getResources = async (req, res) => {
    try {
        const { search, subject, audience, page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const filter = { visibility: 'public' };
        if (subject) filter.subject = { $regex: subject, $options: 'i' };
        if (audience && audience !== 'all') filter.audience = { $in: [audience, 'all'] };
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const [resources, total] = await Promise.all([
            ResourceModel.find(filter)
                .populate('createdBy', 'fullName image role')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            ResourceModel.countDocuments(filter)
        ]);

        return res.status(200).json({ status: true, message: "Fetched", resources, total });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error" });
    }
};

const getResource = async (req, res) => {
    try {
        const resource = await ResourceModel.findById(req.params.resourceId)
            .populate('createdBy', 'fullName image role');
        if (!resource) return res.status(404).json({ status: false, message: "Resource not found" });
        return res.status(200).json({ status: true, message: "Fetched", resource });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error" });
    }
};

const updateResource = async (req, res) => {
    try {
        const { resourceId } = req.params;
        const userId = req.user._id.toString();

        const resource = await ResourceModel.findById(resourceId);
        if (!resource) return res.status(404).json({ status: false, message: "Resource not found" });
        if (resource.createdBy.toString() !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ status: false, message: "Not authorised" });
        }

        const allowed = ['title', 'description', 'url', 'subject', 'visibility', 'audience'];
        allowed.forEach(f => { if (req.body[f] !== undefined) resource[f] = req.body[f]; });
        await resource.save();
        return res.status(200).json({ status: true, message: "Resource updated", resource });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error" });
    }
};

const deleteResource = async (req, res) => {
    try {
        const { resourceId } = req.params;
        const userId = req.user._id.toString();

        const resource = await ResourceModel.findById(resourceId);
        if (!resource) return res.status(404).json({ status: false, message: "Resource not found" });
        if (resource.createdBy.toString() !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ status: false, message: "Not authorised" });
        }

        await ResourceModel.findByIdAndDelete(resourceId);
        return res.status(200).json({ status: true, message: "Resource deleted" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error" });
    }
};

export { createResource, getResources, getResource, updateResource, deleteResource };
