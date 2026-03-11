// Cloudflare Pages Function to handle reviews
// This will work automatically when deployed to Cloudflare Pages

export async function onRequestGet({ env }) {
  try {
    // Get reviews from KV storage
    const reviewsData = await env.REVIEWS_KV?.get('reviews');
    let reviews = [];
    
    if (reviewsData) {
      try {
        reviews = JSON.parse(reviewsData);
      } catch (e) {
        console.error('Failed to parse reviews:', e);
        reviews = [];
      }
    }
    
    return new Response(JSON.stringify(reviews), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=60'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestPost({ request, env }) {
  try {
    const data = await request.json();
    
    // Validate input
    if (!data.name || !data.message || !data.rating) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get existing reviews
    const reviewsData = await env.REVIEWS_KV?.get('reviews');
    let reviews = [];
    
    if (reviewsData) {
      try {
        reviews = JSON.parse(reviewsData);
      } catch (e) {
        console.error('Failed to parse existing reviews:', e);
        reviews = [];
      }
    }
    
    // Add new review
    const newReview = {
      name: data.name.substring(0, 50),
      message: data.message.substring(0, 500),
      rating: Math.min(5, Math.max(1, parseInt(data.rating))),
      timestamp: Date.now(),
      approved: true // Auto-approved
    };
    
    reviews.push(newReview);
    
    // Save back to KV
    await env.REVIEWS_KV?.put('reviews', JSON.stringify(reviews));
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Review submitted successfully!' 
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Failed to submit review',
      message: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
