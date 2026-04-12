'use client';

export default function TrendsPage() {
  return (
    <section className="w-full min-h-screen bg-black text-light-100">
      <div className="container mx-auto px-5 2xl:px-0 py-20">
        
        {/* Header */}
        <div className="mb-16">
          <h1 className="text-white font-bold text-3xl md:text-5xl uppercase mb-4">
            Market Trends
          </h1>
          <p className="text-light-100 text-lg max-w-2xl">
            Explore the latest trends in the cryptocurrency and blockchain space. 
            Discover insights, analysis, and real-time market data.
          </p>
        </div>

        {/* Trending Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div 
              key={item}
              className="bg-neutral-900 rounded-lg p-6 border border-neutral-800 hover:border-neutral-700 transition-all duration-300"
            >
              <div className="h-40 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg mb-4"></div>
              <h3 className="text-white font-semibold text-lg uppercase mb-2">
                Trend #{item}
              </h3>
              <p className="text-light-100 text-sm mb-4">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                Discover what's moving the markets today.
              </p>
              <div className="flex justify-between items-center">
                <span className="text-xs text-dark-100">2 hours ago</span>
                <button className="px-3 py-1 bg-primary text-white rounded text-xs font-medium hover:opacity-80 transition-all">
                  Learn More
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Featured Section */}
        <div className="bg-neutral-900 rounded-lg p-8 border border-neutral-800">
          <h2 className="text-white font-bold text-xl uppercase mb-4">Featured Insight</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="h-64 bg-gradient-to-r from-pink-500 to-orange-500 rounded-lg"></div>
            <div className="flex flex-col justify-center">
              <h3 className="text-white font-semibold text-lg uppercase mb-4">
                The Future of DeFi is Here
              </h3>
              <p className="text-light-100 mb-4">
                Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
                Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
              </p>
              <p className="text-light-100 mb-6">
                Duis aute irure dolor in reprehenderit in voluptate velit esse 
                cillum dolore eu fugiat nulla pariatur.
              </p>
              <button className="w-fit px-6 py-2 bg-primary text-white rounded font-medium hover:opacity-80 transition-all">
                Read Full Article
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
