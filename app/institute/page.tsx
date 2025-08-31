'use client';

import Link from 'next/link';
import { useState } from 'react';

interface TimelineEvent {
  year: string;
  title: string;
  description: string;
}

interface ResearchArea {
  title: string;
  description: string;
  icon: string;
}

interface TeamMember {
  name: string;
  role: string;
  department: string;
  bio: string;
}

export default function InstitutePage() {
  const [activeSection, setActiveSection] = useState<'overview' | 'history' | 'research' | 'team' | 'mission'>('overview');

  const timelineEvents: TimelineEvent[] = [
    {
      year: "1987",
      title: "Foundation",
      description: "Established as an independent research facility focusing on botanical and temporal studies in rural Ireland."
    },
    {
      year: "1993",
      title: "Digital Archives",
      description: "First implementation of digital record-keeping systems for field research data."
    },
    {
      year: "2001",
      title: "Expansion",
      description: "Construction of the Advanced Botanical Laboratory and expansion of field research capabilities."
    },
    {
      year: "2008",
      title: "Recognition",
      description: "Received international recognition for contributions to environmental research methodologies."
    },
    {
      year: "2015",
      title: "Network Integration",
      description: "Launch of collaborative research network connecting field operatives across multiple continents."
    },
    {
      year: "2023",
      title: "Digital Platform",
      description: "Implementation of comprehensive digital platform for research coordination and data sharing."
    }
  ];

  const researchAreas: ResearchArea[] = [
    {
      title: "Botanical Documentation",
      description: "Systematic cataloging and analysis of plant specimens with focus on environmental adaptation patterns.",
      icon: "🌱"
    },
    {
      title: "Field Research Methodology",
      description: "Development of evidence-based protocols for environmental data collection and analysis.",
      icon: "🔬"
    },
    {
      title: "Temporal Data Analysis",
      description: "Long-term environmental monitoring and pattern recognition across multiple temporal scales.",
      icon: "📊"
    },
    {
      title: "Collaborative Networks",
      description: "Coordination of distributed research teams and standardization of research protocols.",
      icon: "🌐"
    }
  ];

  const teamMembers: TeamMember[] = [
    {
      name: "Dr. Eleanor Fitzgerald",
      role: "Director of Research",
      department: "Administration",
      bio: "Leading environmental research for over 25 years, specializing in ecosystem adaptation studies."
    },
    {
      name: "Prof. Marcus Chen",
      role: "Head of Field Operations",
      department: "Field Research",
      bio: "Coordinates global research network with expertise in botanical documentation protocols."
    },
    {
      name: "Dr. Sarah O'Brien",
      role: "Data Systems Manager",
      department: "Technical",
      bio: "Develops and maintains digital infrastructure for research data management and analysis."
    },
    {
      name: "Dr. James Murphy",
      role: "Senior Researcher",
      department: "Research",
      bio: "Environmental scientist with focus on long-term ecological monitoring and pattern analysis."
    }
  ];

  const sections = [
    { id: 'overview' as const, name: 'Overview' },
    { id: 'history' as const, name: 'History' },
    { id: 'research' as const, name: 'Research' },
    { id: 'team' as const, name: 'Team' },
    { id: 'mission' as const, name: 'Mission' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-neutral-100 to-neutral-150 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.4'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3Ccircle cx='53' cy='53' r='1'/%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-semibold text-neutral-900 mb-4 leading-tight">
            Galway Research Institute
          </h1>
          <p className="text-lg text-neutral-600 font-mono leading-relaxed max-w-3xl mx-auto">
            Field-tested research. Evidence-based iteration.
          </p>
          <div className="mt-6 text-sm text-neutral-500 font-mono">
            Independent Research Facility • Established 2018 • Canada
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-lg border border-neutral-200 mb-8">
          <div className="flex flex-wrap border-b border-neutral-200">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`px-6 py-4 font-mono text-sm uppercase tracking-wide transition-all duration-200 border-b-2 ${
                  activeSection === section.id
                    ? 'border-neutral-900 text-neutral-900 bg-neutral-50'
                    : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                }`}
              >
                {section.name}
              </button>
            ))}
          </div>

          <div className="p-8">
            {/* Overview Section */}
            {activeSection === 'overview' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-semibold text-neutral-900 mb-4 font-mono">About the Institute</h2>
                  <div className="prose prose-neutral max-w-none">
                    <p className="text-neutral-700 leading-relaxed mb-4">
                      The Galway Research Institute operates as an independent research facility dedicated to 
                      environmental studies, botanical documentation, and field research methodology development. 
                      Established in 1987, we maintain a commitment to rigorous scientific standards and 
                      evidence-based research practices.
                    </p>
                    <p className="text-neutral-700 leading-relaxed mb-4">
                      Our work focuses on long-term environmental monitoring, systematic botanical cataloging, 
                      and the development of collaborative research networks. We prioritize field-tested methodologies 
                      and maintain extensive databases of environmental data collected across multiple continents.
                    </p>
                    <p className="text-neutral-700 leading-relaxed">
                      The Institute operates with a distributed network of field operatives and researchers, 
                      coordinating efforts through our digital platform to ensure consistent data collection 
                      standards and collaborative analysis capabilities.
                    </p>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-neutral-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-neutral-900 font-mono">36+</div>
                    <div className="text-sm text-neutral-600 font-mono">Years of Research</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-neutral-900 font-mono">15k+</div>
                    <div className="text-sm text-neutral-600 font-mono">Documented Specimens</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-neutral-900 font-mono">200+</div>
                    <div className="text-sm text-neutral-600 font-mono">Active Operatives</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-neutral-900 font-mono">12</div>
                    <div className="text-sm text-neutral-600 font-mono">Countries</div>
                  </div>
                </div>
              </div>
            )}

            {/* History Section */}
            {activeSection === 'history' && (
              <div>
                <h2 className="text-2xl font-semibold text-neutral-900 mb-6 font-mono">Institute Timeline</h2>
                <div className="space-y-6">
                  {timelineEvents.map((event, index) => (
                    <div key={index} className="flex">
                      <div className="flex-shrink-0 w-20">
                        <div className="text-lg font-bold text-neutral-900 font-mono">{event.year}</div>
                      </div>
                      <div className="flex-1 ml-6">
                        <h3 className="text-lg font-semibold text-neutral-900 mb-2">{event.title}</h3>
                        <p className="text-neutral-700 leading-relaxed">{event.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Research Section */}
            {activeSection === 'research' && (
              <div>
                <h2 className="text-2xl font-semibold text-neutral-900 mb-6 font-mono">Research Areas</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {researchAreas.map((area, index) => (
                    <div key={index} className="bg-neutral-50 rounded-lg p-6 border border-neutral-200">
                      <div className="flex items-start space-x-4">
                        <div className="text-2xl">{area.icon}</div>
                        <div>
                          <h3 className="text-lg font-semibold text-neutral-900 mb-2">{area.title}</h3>
                          <p className="text-neutral-700 leading-relaxed text-sm">{area.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-neutral-200">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4 font-mono">Current Projects</h3>
                  <div className="space-y-4">
                    <div className="bg-white rounded p-4 border border-neutral-200">
                      <h4 className="font-medium text-neutral-900 mb-2">Global Botanical Network Expansion</h4>
                      <p className="text-sm text-neutral-700">Coordinating research efforts across 12 countries to establish standardized botanical documentation protocols.</p>
                    </div>
                    <div className="bg-white rounded p-4 border border-neutral-200">
                      <h4 className="font-medium text-neutral-900 mb-2">Long-term Environmental Monitoring</h4>
                      <p className="text-sm text-neutral-700">35-year longitudinal study tracking environmental changes and ecosystem adaptation patterns.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Team Section */}
            {activeSection === 'team' && (
              <div>
                <h2 className="text-2xl font-semibold text-neutral-900 mb-6 font-mono">Leadership Team</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {teamMembers.map((member, index) => (
                    <div key={index} className="bg-white rounded-lg p-6 border border-neutral-200">
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold text-neutral-900">{member.name}</h3>
                        <div className="text-sm text-neutral-600 font-mono">{member.role}</div>
                        <div className="text-xs text-neutral-500 font-mono">{member.department}</div>
                      </div>
                      <p className="text-sm text-neutral-700 leading-relaxed">{member.bio}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-neutral-200">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4 font-mono">Join Our Team</h3>
                  <p className="text-neutral-700 mb-4">
                    We regularly seek qualified researchers and field operatives to join our distributed research network. 
                    Positions range from field data collection to laboratory analysis and systems coordination.
                  </p>
                  <Link 
                    href="/correspondence"
                    className="inline-block px-6 py-3 bg-neutral-900 text-white font-mono text-sm uppercase tracking-wide hover:bg-neutral-700 transition-colors duration-200"
                  >
                    Contact Us About Opportunities
                  </Link>
                </div>
              </div>
            )}

            {/* Mission Section */}
            {activeSection === 'mission' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-semibold text-neutral-900 mb-4 font-mono">Mission Statement</h2>
                  <div className="bg-neutral-50 rounded-lg p-6 border border-neutral-200">
                    <p className="text-lg text-neutral-700 leading-relaxed font-mono italic">
                      "To advance environmental understanding through rigorous field research, systematic documentation, 
                      and collaborative scientific methodology, while maintaining the highest standards of data integrity 
                      and research transparency."
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-neutral-900 mb-4 font-mono">Core Values</h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-neutral-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">🔬</span>
                      </div>
                      <h4 className="font-semibold text-neutral-900 mb-2">Scientific Rigor</h4>
                      <p className="text-sm text-neutral-700">Evidence-based methodology and peer-reviewed standards.</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-neutral-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">🌍</span>
                      </div>
                      <h4 className="font-semibold text-neutral-900 mb-2">Global Collaboration</h4>
                      <p className="text-sm text-neutral-700">Coordinated international research networks.</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-neutral-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">📚</span>
                      </div>
                      <h4 className="font-semibold text-neutral-900 mb-2">Data Integrity</h4>
                      <p className="text-sm text-neutral-700">Transparent documentation and open research practices.</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-neutral-900 mb-4 font-mono">Research Philosophy</h3>
                  <div className="prose prose-neutral max-w-none">
                    <p className="text-neutral-700 leading-relaxed mb-4">
                      Our approach emphasizes long-term perspective and systematic methodology. We believe that 
                      meaningful environmental research requires sustained observation, careful documentation, 
                      and collaborative analysis across multiple temporal and geographical scales.
                    </p>
                    <p className="text-neutral-700 leading-relaxed">
                      We prioritize field-tested approaches over theoretical models, while maintaining rigorous 
                      standards for data collection and analysis. Our work contributes to broader scientific 
                      understanding while serving practical applications in environmental monitoring and conservation.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-white rounded-lg p-6 border border-neutral-200 text-center">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4 font-mono">Contact the Institute</h3>
          <p className="text-neutral-700 mb-4">
            For research inquiries, collaboration proposals, or general information about our work.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/correspondence"
              className="px-6 py-3 bg-transparent text-neutral-900 font-mono text-sm uppercase tracking-wide hover:bg-neutral-900 hover:text-white transition-all duration-200 border-2 border-neutral-300 hover:border-neutral-900"
            >
              Send Message
            </Link>
            <Link
              href="/"
              className="px-6 py-3 bg-neutral-100 text-neutral-700 font-mono text-sm uppercase tracking-wide hover:bg-neutral-200 transition-all duration-200 border-2 border-neutral-200"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}