import { db } from './client.js';

async function seed() {
  console.log('🌱 Seeding database...');

  // Create sample agents
  const supervisorAgent = await db.agent.create({
    data: {
      name: 'Strategic Supervisor',
      type: 'SUPERVISOR',
      role: 'Define political strategy and objectives',
      sources: ['Policy documents', 'Stakeholder input'],
    },
  });

  const simulationAgent = await db.agent.create({
    data: {
      name: 'Urban Simulation Engine',
      type: 'SIMULATION',
      role: 'Simulate policy impacts using real urban data',
      sources: ['Census', 'OpenStreetMap', 'EPA', 'HUD'],
    },
  });

  const debateAgent = await db.agent.create({
    data: {
      name: 'Policy Debate Simulator',
      type: 'DEBATE',
      role: 'Generate pro/con arguments and risk assessment',
      sources: ['Simulation results', 'Policy documents'],
    },
  });

  const aggregatorAgent = await db.agent.create({
    data: {
      name: 'Report Aggregator',
      type: 'AGGREGATOR',
      role: 'Compile comprehensive policy reports',
      sources: ['Simulations', 'Debates', 'Strategic objectives'],
    },
  });

  const propagandaAgent = await db.agent.create({
    data: {
      name: 'Communications Generator',
      type: 'PROPAGANDA',
      role: 'Create public communications materials',
      sources: ['Reports', 'Strategic messaging'],
    },
  });

  // Create sample project
  const project = await db.project.create({
    data: {
      name: 'Downtown Transit-Oriented Development',
      description: 'Evaluate mixed-use development around new transit hub',
      city: 'San Francisco, CA',
      region: 'Bay Area',
    },
  });

  // Link agents to project
  await db.projectAgent.createMany({
    data: [
      { projectId: project.id, agentId: supervisorAgent.id },
      { projectId: project.id, agentId: simulationAgent.id },
      { projectId: project.id, agentId: debateAgent.id },
      { projectId: project.id, agentId: aggregatorAgent.id },
    ],
  });

  console.log('✅ Seed data created:');
  console.log(`   - 5 agents created`);
  console.log(`   - 1 sample project created`);
  console.log(`   - Project ID: ${project.id}`);
}

seed()
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });


