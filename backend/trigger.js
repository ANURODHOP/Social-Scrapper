async function run() {
  console.log('Creating profile...');
  const res1 = await fetch('http://localhost:3000/api/profiles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      platform: 'instagram',
      platformId: 'fabriziorom',
      username: 'fabriziorom'
    })
  });
  
  const data1 = await res1.json();
  console.log('Profile Response:', data1);

  if (!data1.success) {
    console.error('Failed to create profile, aborting trigger.');
    return;
  }

  const profileId = data1.data.id;
  
  console.log('Triggering scheduler for profile:', profileId);
  const res2 = await fetch(`http://localhost:3000/api/profiles/${profileId}/process`, {
    method: 'POST'
  });
  const data2 = await res2.json();
  console.log('Process Response:', JSON.stringify(data2, null, 2));
}

run().catch(console.error);
