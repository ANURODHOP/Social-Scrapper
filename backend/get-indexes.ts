import 'dotenv/config';
import { db } from './src/firebase';

async function main() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Instead of promises, we store functions that return promises
  const queries = [
    { name: 'profiles (deletedAt, isActive)', fn: () => db.collection('profiles').where('deletedAt', '==', null).where('isActive', '==', true).get() },
    { name: 'posts (deletedAt, createdAt)', fn: () => db.collection('posts').where('deletedAt', '==', null).where('createdAt', '>=', today).get() },
    { name: 'posts (deletedAt, mediaType, createdAt)', fn: () => db.collection('posts').where('deletedAt', '==', null).where('createdAt', '>=', today).where('mediaType', 'in', ['VIDEO', 'REEL']).get() },
    { name: 'posts (deletedAt, publishedAt DESC)', fn: () => db.collection('posts').where('deletedAt', '==', null).orderBy('publishedAt', 'desc').limit(5).get() },
    { name: 'reports (generatedAt DESC)', fn: () => db.collection('reports').orderBy('generatedAt', 'desc').limit(5).get() },
    { name: 'schedulerRuns (startedAt DESC)', fn: () => db.collection('schedulerRuns').orderBy('startedAt', 'desc').limit(5).get() },
    { name: 'notificationHistory (provider, status)', fn: () => db.collection('notificationHistory').where('provider', '==', 'telegram').where('status', '==', 'sent').get() },
  ];

  console.log('Testing queries sequentially to find missing indexes...\n');
  const links: string[] = [];

  for (const q of queries) {
    try {
      await q.fn();
      console.log(`✅ [OK] ${q.name}`);
    } catch (e: any) {
      if (e.message && e.message.includes('The query requires an index')) {
        const urlMatch = e.message.match(/https:\/\/console\.firebase\.google\.com[^\s']*/);
        if (urlMatch) {
          console.log(`❌ [MISSING INDEX] ${q.name}`);
          console.log(`   Link: ${urlMatch[0]}`);
          links.push(urlMatch[0]);
        } else if (e.message.includes('currently building')) {
          console.log(`⏳ [BUILDING] ${q.name}`);
        } else {
          console.log(`❌ [ERROR] ${q.name}: ${e.message}`);
        }
      } else {
        console.log(`❌ [ERROR] ${q.name}: ${e.message}`);
      }
    }
  }

  console.log('\n--- ALL MISSING INDEX LINKS ---');
  links.forEach(l => console.log(l));
  process.exit(0);
}

main().catch(console.error);
