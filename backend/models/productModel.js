import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    image: { type: String, required: true },
    brand: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    countInStock: { type: Number, required: true },
    rating: { type: Number, default: 0 }, // Calculat automat din recenzii
    numReviews: { type: Number, default: 0 }, // Calculat automat
    description: { type: String }, // Observ că lipsea din șemă, dar o folosești în frontend
  },
  {
    timestamps: true,
  }
);

// Metodă pentru calcularea rating-ului mediu din recenzii
productSchema.methods.updateRating = async function () {
  const Review = mongoose.model('Review');
  const reviews = await Review.find({ product: this._id });

  if (reviews.length > 0) {
    const avgRating =
      reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;
    this.rating = Math.round(avgRating * 10) / 10; // Rotunjește la o zecimală
    this.numReviews = reviews.length;
  } else {
    this.rating = 0;
    this.numReviews = 0;
  }

  await this.save();
};

// Virtual pentru a popula recenziile
productSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'product',
});

// Asigură-te că virtualele sunt incluse la converting la JSON
productSchema.set('toJSON', { virtuals: true });

const Product = mongoose.model('Product', productSchema);
export default Product;
