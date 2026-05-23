const fs = require('fs');

module.exports = function makePosesModule(tree, DATA_FILE) {
  function parsePosesFallback(rawText) {
    const items = [];
    const idMatch = rawText.match(/"id"\s*:\s*(\d+)/i);
    const titleMatch = rawText.match(/"title"\s*:\s*"([^"]*)"/i);
    const descMatch = rawText.match(/"description"\s*:\s*"([^"]*)"/i);
    const diffMatch = rawText.match(/"difficulty"\s*:\s*(\d+)/i);
    const photoMatch = rawText.match(/"photo"\s*:\s*"([^"]*)"/i);

    if (!idMatch || !titleMatch) return items;

    const id = Number(idMatch[1]);
    const difficulty = diffMatch ? Number(diffMatch[1]) : id;
    items.push({
      id,
      title: titleMatch[1],
      description: descMatch ? descMatch[1] : '',
      difficulty,
      photo: photoMatch ? photoMatch[1] : '',
    });

    return items;
  }

  function loadPoses() {
    if (!fs.existsSync(DATA_FILE)) return 1;
    try {
      tree.root = tree.Nil;
      let nextId = 1;
      const raw = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
      raw.forEach((p) => {
        const node = tree.createNode(p.difficulty, {
          id: p.id,
          title: p.title,
          description: p.description,
          photo: p.photo,
          difficulty: p.difficulty,
        });
        tree.RBInsert(node);
        if (p.id >= nextId) nextId = p.id + 1;
      });
      console.log(`Loaded ${raw.length} poses.`);
      return nextId;
    } catch (e) {
      try {
        const fallbackRaw = fs.readFileSync(DATA_FILE, 'utf8');
        const fallback = parsePosesFallback(fallbackRaw);
        let nextId = 1;
        fallback.forEach((p) => {
          const node = tree.createNode(p.difficulty, {
            id: p.id,
            title: p.title,
            description: p.description,
            photo: p.photo,
            difficulty: p.difficulty,
          });
          tree.RBInsert(node);
          if (p.id >= nextId) nextId = p.id + 1;
        });
        if (fallback.length) {
          console.warn('poses.json was malformed, loaded fallback data.');
          return nextId;
        }
      } catch {
        // ignore and fall through
      }
      console.error('Failed to load poses:', e);
      return 1;
    }
  }

  function savePoses() {
    const list = tree.toList().map((n) => ({
      id: n.data.id,
      title: n.data.title,
      description: n.data.description,
      photo: n.data.photo,
      difficulty: n.data.difficulty,
    }));
    fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2));
  }

  function watchPoses(onChange) {
    try {
      fs.watchFile(DATA_FILE, { interval: 1000 }, (curr, prev) => {
        if (curr.mtimeMs !== prev.mtimeMs) onChange();
      });
    } catch {
      // ignore
    }
  }

  return { loadPoses, savePoses, watchPoses };
};
