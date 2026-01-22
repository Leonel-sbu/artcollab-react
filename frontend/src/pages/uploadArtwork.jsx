// src/pages/UploadArtwork.jsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Upload,
    Image as ImageIcon,
    Tag,
    DollarSign,
    Globe,
    Lock,
    X,
    Check,
    AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const UploadArtwork = () => {
    const [step, setStep] = useState(1);
    const [preview, setPreview] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        tags: [],
        price: '',
        royalty: '10',
        licenseType: 'personal',
        isExclusive: false,
        file: null
    });

    const categories = ['Abstract', 'Digital', '3D', 'Generative', 'Illustration', 'Photography', 'Animation'];

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 50 * 1024 * 1024) {
                toast.error('File size must be less than 50MB');
                return;
            }
            if (!['image/jpeg', 'image/png', 'image/gif', 'video/mp4'].includes(file.type)) {
                toast.error('Unsupported file format');
                return;
            }
            setFormData({ ...formData, file });
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validate form
        if (!formData.title.trim()) {
            toast.error('Please enter a title');
            return;
        }
        if (!formData.category) {
            toast.error('Please select a category');
            return;
        }
        if (!formData.price) {
            toast.error('Please set a price');
            return;
        }
        if (!formData.file) {
            toast.error('Please upload a file');
            return;
        }

        // Here you would normally upload to Firebase/Blockchain
        toast.success('Artwork uploaded successfully!');

        // Reset form
        setFormData({
            title: '',
            description: '',
            category: '',
            tags: [],
            price: '',
            royalty: '10',
            licenseType: 'personal',
            isExclusive: false,
            file: null
        });
        setPreview(null);
        setStep(1);
    };

    const addTag = (tag) => {
        const trimmedTag = tag.trim().toLowerCase();
        if (trimmedTag && !formData.tags.includes(trimmedTag) && formData.tags.length < 10) {
            setFormData({ ...formData, tags: [...formData.tags, trimmedTag] });
        }
    };

    const removeTag = (tagToRemove) => {
        setFormData({ ...formData, tags: formData.tags.filter(tag => tag !== tagToRemove) });
    };

    const steps = [
        { number: 1, title: 'Upload', icon: Upload },
        { number: 2, title: 'Details', icon: ImageIcon },
        { number: 3, title: 'Pricing', icon: DollarSign },
        { number: 4, title: 'Review', icon: Check }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-dark-900 to-dark-800 text-white p-4 md:p-6">
            <div className="max-w-4xl mx-auto">
                {/* Progress Steps */}
                <div className="mb-12">
                    <div className="flex justify-between relative">
                        {steps.map((stepItem, index) => (
                            <div key={stepItem.number} className="flex flex-col items-center z-10">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${step >= stepItem.number
                                        ? 'bg-gradient-to-r from-purple-600 to-blue-600'
                                        : 'bg-dark-800'
                                    }`}>
                                    {step > stepItem.number ? (
                                        <Check className="w-6 h-6" />
                                    ) : (
                                        <stepItem.icon className="w-6 h-6" />
                                    )}
                                </div>
                                <div className="text-sm">{stepItem.title}</div>
                            </div>
                        ))}
                        <div className="absolute top-6 left-0 right-0 h-1 bg-dark-800 -z-10">
                            <motion.div
                                className="h-full bg-gradient-to-r from-purple-600 to-blue-600"
                                initial={{ width: '0%' }}
                                animate={{ width: `${((step - 1) / 3) * 100}%` }}
                                transition={{ duration: 0.5 }}
                            />
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Step 1: Upload */}
                    {step === 1 && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="glass-effect rounded-2xl p-6 md:p-8"
                        >
                            <h2 className="text-3xl font-bold mb-6">Upload Your Artwork</h2>

                            <div
                                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${preview
                                        ? 'border-green-500 bg-green-900/10'
                                        : 'border-gray-600 hover:border-purple-500 hover:bg-dark-800/50'
                                    }`}
                                onClick={() => document.getElementById('file-upload').click()}
                            >
                                <input
                                    type="file"
                                    id="file-upload"
                                    className="hidden"
                                    accept="image/*,video/*"
                                    onChange={handleFileUpload}
                                />

                                {preview ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                    >
                                        <img
                                            src={preview}
                                            alt="Preview"
                                            className="max-h-64 mx-auto mb-4 rounded-lg object-cover"
                                        />
                                        <p className="text-green-400 flex items-center justify-center gap-2">
                                            <Check className="w-5 h-5" />
                                            File uploaded successfully!
                                        </p>
                                    </motion.div>
                                ) : (
                                    <>
                                        <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                                        <h3 className="text-xl font-semibold mb-2">Drop your file here</h3>
                                        <p className="text-gray-400 mb-4">or click to browse</p>
                                        <p className="text-sm text-gray-500">
                                            Supports: JPG, PNG, GIF, MP4 • Max 50MB
                                        </p>
                                    </>
                                )}
                            </div>

                            <div className="mt-8 grid md:grid-cols-3 gap-4">
                                <div className="bg-dark-800/50 p-4 rounded-xl">
                                    <ImageIcon className="w-8 h-8 mb-2 text-purple-400" />
                                    <div className="font-semibold">High Quality</div>
                                    <div className="text-sm text-gray-400">Minimum 2000px recommended</div>
                                </div>
                                <div className="bg-dark-800/50 p-4 rounded-xl">
                                    <Globe className="w-8 h-8 mb-2 text-blue-400" />
                                    <div className="font-semibold">Global Reach</div>
                                    <div className="text-sm text-gray-400">Available to collectors worldwide</div>
                                </div>
                                <div className="bg-dark-800/50 p-4 rounded-xl">
                                    <Lock className="w-8 h-8 mb-2 text-green-400" />
                                    <div className="font-semibold">Secure</div>
                                    <div className="text-sm text-gray-400">Blockchain verified ownership</div>
                                </div>
                            </div>

                            <div className="flex justify-between mt-8">
                                <div></div>
                                <button
                                    type="button"
                                    onClick={() => setStep(2)}
                                    disabled={!formData.file}
                                    className={`px-8 py-3 rounded-lg font-semibold transition ${formData.file
                                            ? 'btn-primary'
                                            : 'bg-dark-700 text-gray-500 cursor-not-allowed'
                                        }`}
                                >
                                    Next: Add Details
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 2: Details */}
                    {step === 2 && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="glass-effect rounded-2xl p-6 md:p-8"
                        >
                            <h2 className="text-3xl font-bold mb-6">Artwork Details</h2>

                            <div className="space-y-6">
                                <div>
                                    <label className="block mb-2 font-medium">Title *</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full bg-dark-800 border border-dark-700 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
                                        placeholder="Enter artwork title"
                                        maxLength={100}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block mb-2 font-medium">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full bg-dark-800 border border-dark-700 rounded-lg px-4 py-3 h-32 focus:outline-none focus:border-purple-500"
                                        placeholder="Tell the story behind your artwork..."
                                        maxLength={1000}
                                    />
                                </div>

                                <div>
                                    <label className="block mb-2 font-medium">Category *</label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {categories.map((cat) => (
                                            <button
                                                key={cat}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, category: cat })}
                                                className={`py-3 rounded-lg transition ${formData.category === cat
                                                        ? 'bg-gradient-to-r from-purple-600 to-blue-600'
                                                        : 'bg-dark-800 hover:bg-dark-700'
                                                    }`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block mb-2 font-medium">Tags</label>
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {formData.tags.map((tag) => (
                                            <div key={tag} className="flex items-center gap-2 bg-purple-900/50 px-3 py-1 rounded-full">
                                                #{tag}
                                                <button
                                                    type="button"
                                                    onClick={() => removeTag(tag)}
                                                    className="hover:text-red-400"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    addTag(e.target.value);
                                                    e.target.value = '';
                                                }
                                            }}
                                            className="flex-1 bg-dark-800 border border-dark-700 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
                                            placeholder="Add tag and press Enter"
                                            maxLength={20}
                                        />
                                        <button
                                            type="button"
                                            className="px-4 bg-dark-700 rounded-lg hover:bg-dark-600"
                                            onClick={(e) => {
                                                const input = e.target.previousSibling;
                                                addTag(input.value);
                                                input.value = '';
                                            }}
                                        >
                                            <Tag className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <p className="text-sm text-gray-400 mt-2">
                                        Add up to 10 tags to help collectors find your work
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-between mt-8">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="px-8 py-3 border border-gray-600 rounded-lg hover:bg-dark-700"
                                >
                                    Back
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStep(3)}
                                    disabled={!formData.title || !formData.category}
                                    className={`px-8 py-3 rounded-lg font-semibold transition ${formData.title && formData.category
                                            ? 'btn-primary'
                                            : 'bg-dark-700 text-gray-500 cursor-not-allowed'
                                        }`}
                                >
                                    Next: Pricing
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 3: Pricing */}
                    {step === 3 && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="glass-effect rounded-2xl p-6 md:p-8"
                        >
                            <h2 className="text-3xl font-bold mb-6">Pricing & Rights</h2>

                            <div className="space-y-6">
                                <div>
                                    <label className="block mb-2 font-medium">
                                        <DollarSign className="inline w-4 h-4 mr-1" />
                                        Price (ETH) *
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="number"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                            className="flex-1 bg-dark-800 border border-dark-700 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
                                            placeholder="0.00"
                                            min="0"
                                            step="0.01"
                                            required
                                        />
                                        <div className="text-2xl font-semibold">ETH</div>
                                    </div>
                                    <p className="text-sm text-gray-400 mt-2">
                                        Current ETH price: $3,500 (approximate)
                                    </p>
                                </div>

                                <div>
                                    <label className="block mb-2 font-medium">Royalty Percentage *</label>
                                    <div className="flex items-center gap-4 mb-2">
                                        <input
                                            type="range"
                                            min="5"
                                            max="30"
                                            step="1"
                                            value={formData.royalty}
                                            onChange={(e) => setFormData({ ...formData, royalty: e.target.value })}
                                            className="flex-1"
                                        />
                                        <span className="w-20 text-center text-2xl font-bold">{formData.royalty}%</span>
                                    </div>
                                    <p className="text-sm text-gray-400">
                                        You'll earn this percentage on all secondary sales
                                    </p>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="bg-dark-800/50 p-6 rounded-xl">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="font-semibold">License Type</h3>
                                            <Globe className="w-5 h-5" />
                                        </div>
                                        <div className="space-y-3">
                                            {[
                                                { value: 'personal', label: 'Personal Use Only' },
                                                { value: 'commercial', label: 'Commercial License' },
                                                { value: 'exclusive', label: 'Exclusive Rights' }
                                            ].map((type) => (
                                                <label key={type.value} className="flex items-center gap-3 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="license"
                                                        value={type.value}
                                                        checked={formData.licenseType === type.value}
                                                        onChange={(e) => setFormData({ ...formData, licenseType: e.target.value })}
                                                        className="w-4 h-4"
                                                    />
                                                    <span>{type.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-dark-800/50 p-6 rounded-xl">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="font-semibold">Exclusive Content</h3>
                                            <Lock className="w-5 h-5" />
                                        </div>
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.isExclusive}
                                                onChange={(e) => setFormData({ ...formData, isExclusive: e.target.checked })}
                                                className="w-4 h-4"
                                            />
                                            <span>Make this artwork exclusive to ArtCollab</span>
                                        </label>
                                        <p className="text-sm text-gray-400 mt-2">
                                            Exclusive content gets premium promotion and higher visibility
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 p-4 rounded-lg">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
                                        <div className="text-sm">
                                            <p className="font-semibold mb-1">Important Notice</p>
                                            <p className="text-gray-400">
                                                Once published on the blockchain, artworks cannot be deleted or modified.
                                                Please review all details carefully before proceeding.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between mt-8">
                                <button
                                    type="button"
                                    onClick={() => setStep(2)}
                                    className="px-8 py-3 border border-gray-600 rounded-lg hover:bg-dark-700"
                                >
                                    Back
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStep(4)}
                                    disabled={!formData.price}
                                    className={`px-8 py-3 rounded-lg font-semibold transition ${formData.price
                                            ? 'btn-primary'
                                            : 'bg-dark-700 text-gray-500 cursor-not-allowed'
                                        }`}
                                >
                                    Review & Publish
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 4: Review */}
                    {step === 4 && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="glass-effect rounded-2xl p-6 md:p-8"
                        >
                            <h2 className="text-3xl font-bold mb-6">Review & Publish</h2>

                            <div className="space-y-6">
                                {/* Preview Card */}
                                <div className="bg-dark-800/50 rounded-xl p-6">
                                    <h3 className="text-xl font-semibold mb-4">Preview</h3>
                                    <div className="flex flex-col md:flex-row gap-6">
                                        {preview && (
                                            <img
                                                src={preview}
                                                alt="Artwork"
                                                className="w-48 h-48 object-cover rounded-lg"
                                            />
                                        )}
                                        <div className="flex-1">
                                            <h4 className="text-2xl font-bold mb-2">{formData.title || "Your Artwork Title"}</h4>
                                            <p className="text-gray-300 mb-4">{formData.description || "No description provided"}</p>
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {formData.tags.map((tag) => (
                                                    <span key={tag} className="bg-purple-900/30 px-3 py-1 rounded-full text-sm">
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </div>
                                            <div className="text-2xl font-bold text-purple-300">
                                                {formData.price ? `${formData.price} ETH` : "Price not set"}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Summary */}
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="bg-dark-800/30 p-6 rounded-xl">
                                        <h3 className="font-semibold mb-4">Details Summary</h3>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Category:</span>
                                                <span>{formData.category || "Not set"}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">License:</span>
                                                <span className="capitalize">{formData.licenseType || "Not set"}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Exclusive:</span>
                                                <span>{formData.isExclusive ? "Yes" : "No"}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">File Type:</span>
                                                <span>{formData.file?.type || "Not uploaded"}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-dark-800/30 p-6 rounded-xl">
                                        <h3 className="font-semibold mb-4">Financial Summary</h3>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Primary Price:</span>
                                                <span>{formData.price || "0"} ETH</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Royalty Fee:</span>
                                                <span>{formData.royalty}%</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Platform Fee:</span>
                                                <span>2.5%</span>
                                            </div>
                                            <div className="flex justify-between border-t border-gray-800 pt-2 mt-2">
                                                <span className="font-semibold">You Earn:</span>
                                                <span className="font-bold text-green-400">
                                                    {formData.price ? `${(parseFloat(formData.price) * 0.975).toFixed(3)} ETH` : "0 ETH"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Terms */}
                                <div className="bg-dark-800/30 p-6 rounded-xl">
                                    <label className="flex items-start gap-3">
                                        <input
                                            type="checkbox"
                                            required
                                            className="w-5 h-5 mt-1"
                                        />
                                        <span className="text-sm">
                                            I confirm that I own all rights to this artwork and agree to the
                                            <a href="#" className="text-purple-400 hover:underline mx-1">Terms of Service</a>.
                                            I understand that once minted, artworks cannot be deleted from the blockchain.
                                        </span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex justify-between mt-8">
                                <button
                                    type="button"
                                    onClick={() => setStep(3)}
                                    className="px-8 py-3 border border-gray-600 rounded-lg hover:bg-dark-700"
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg font-semibold transition-transform hover:scale-105"
                                >
                                    Publish Artwork
                                </button>
                            </div>
                        </motion.div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default UploadArtwork;