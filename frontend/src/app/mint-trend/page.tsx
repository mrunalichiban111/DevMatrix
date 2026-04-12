'use client';

export default function MintTrendPage() {
  return (
    <section className="w-full min-h-screen bg-black text-light-100">
      <div className="container mx-auto px-5 2xl:px-0 py-20">
        
        {/* Header */}
        <div className="mb-16">
          <h1 className="text-white font-bold text-3xl md:text-5xl uppercase mb-4">
            Mint Trend
          </h1>
          <p className="text-light-100 text-lg max-w-2xl">
            Create and mint your own trends on the blockchain. 
            Launch your NFT collections and build your community.
          </p>
        </div>

        {/* Mint Form Section */}
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div className="bg-neutral-900 rounded-lg p-8 border border-neutral-800">
            <h2 className="text-white font-bold text-xl uppercase mb-6">Mint Configuration</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-light-100 text-sm block mb-2">Trend Name</label>
                <input 
                  type="text" 
                  placeholder="Enter trend name" 
                  className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded text-white placeholder-dark-100"
                />
              </div>

              <div>
                <label className="text-light-100 text-sm block mb-2">Description</label>
                <textarea 
                  placeholder="Describe your trend" 
                  rows={4}
                  className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded text-white placeholder-dark-100"
                ></textarea>
              </div>

              <div>
                <label className="text-light-100 text-sm block mb-2">Supply</label>
                <input 
                  type="number" 
                  placeholder="Total supply" 
                  className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded text-white placeholder-dark-100"
                />
              </div>

              <button className="w-full px-6 py-3 bg-primary text-white rounded font-medium hover:opacity-80 transition-all mt-6">
                Create Mint
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg p-8 flex flex-col justify-center items-center">
            <div className="text-center">
              <h3 className="text-white font-semibold text-xl uppercase mb-4">Ready to Mint?</h3>
              <p className="text-white opacity-90 mb-6">
                Upload your media, set your parameters, and launch your trend to the blockchain in minutes.
              </p>
              <img 
                src="/assets/logo.svg" 
                alt="logo" 
                className="h-16 w-auto mx-auto opacity-80"
              />
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Total Minted', value: '12,453' },
            { label: 'Active Creators', value: '2,847' },
            { label: 'Total Volume', value: '$4.2M' },
          ].map((stat, i) => (
            <div 
              key={i}
              className="bg-neutral-900 rounded-lg p-6 border border-neutral-800 text-center"
            >
              <p className="text-dark-100 text-xs uppercase mb-2">{stat.label}</p>
              <p className="text-white font-bold text-3xl">{stat.value}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
