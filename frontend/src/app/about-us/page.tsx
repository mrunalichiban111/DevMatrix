'use client';

export default function AboutUsPage() {
  return (
    <section className="w-full min-h-screen bg-black text-light-100">
      <div className="container mx-auto px-5 2xl:px-0 py-20">
        
        {/* Header */}
        <div className="mb-16">
          <h1 className="text-white font-bold text-3xl md:text-5xl uppercase mb-4">
            About Us
          </h1>
          <p className="text-light-100 text-lg max-w-2xl">
            Discover the story behind DevMatrix and our mission to revolutionize 
            blockchain technology and digital trends.
          </p>
        </div>

        {/* Mission Section */}
        <div className="grid md:grid-cols-2 gap-12 mb-20">
          <div>
            <h2 className="text-white font-bold text-2xl uppercase mb-4">Our Mission</h2>
            <p className="text-light-100 mb-4">
              At DevMatrix, we believe in the power of decentralized technology to transform 
              how people create, share, and monetize digital content. Our platform empowers 
              creators to take control of their assets and build communities around their work.
            </p>
            <p className="text-light-100 mb-4">
              We're committed to making blockchain technology accessible, intuitive, and 
              beneficial for everyone, from seasoned developers to first-time users.
            </p>
            <p className="text-light-100">
              Our vision is to create an ecosystem where innovation thrives and creators 
              are rewarded for their contributions to the digital landscape.
            </p>
          </div>
          <div className="bg-gradient-to-br from-pink-500 to-orange-500 rounded-lg h-96"></div>
        </div>

        {/* Team Section */}
        <div className="mb-20">
          <h2 className="text-white font-bold text-2xl uppercase mb-12">Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Alex Johnson', role: 'CEO & Founder' },
              { name: 'Sarah Chen', role: 'CTO' },
              { name: 'Marcus Wade', role: 'Lead Developer' },
              { name: 'Emma Rodriguez', role: 'Community Manager' },
            ].map((member, i) => (
              <div 
                key={i}
                className="bg-neutral-900 rounded-lg p-6 border border-neutral-800 text-center"
              >
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4"></div>
                <h3 className="text-white font-semibold text-base uppercase">{member.name}</h3>
                <p className="text-dark-100 text-sm">{member.role}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Values Section */}
        <div className="bg-neutral-900 rounded-lg p-12 border border-neutral-800">
          <h2 className="text-white font-bold text-2xl uppercase mb-8">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Transparency',
                description: 'We believe in open communication and honest practices in all our operations.',
              },
              {
                title: 'Innovation',
                description: 'We constantly push boundaries to create cutting-edge solutions for our community.',
              },
              {
                title: 'Community First',
                description: 'Every decision we make considers the well-being and growth of our community.',
              },
            ].map((value, i) => (
              <div key={i}>
                <h3 className="text-white font-semibold text-base uppercase mb-2">{value.title}</h3>
                <p className="text-light-100">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
