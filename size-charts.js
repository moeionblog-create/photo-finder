// Owner-supplied chart revisions, 2026-10-05. Stable IDs and original URLs
// guard against replacing a future upload. Cloud originals remain recoverable.
(() => {
  const revisions = [
  {
    "imageId": "8f125673-94f7-49ea-89f1-82c6b65d06e5",
    "originalUrl": "https://photo-finder-media.moeionblog.workers.dev/images/products%2Fec8b3ef4-bc9c-434e-b938-18fd93bf592f.mage",
    "file": "size-02-20261005.png"
  },
  {
    "imageId": "28836c40-0b2d-4ca1-a00a-fb13480e6777",
    "originalUrl": "https://photo-finder-media.moeionblog.workers.dev/images/products%2Fa428087b-26a6-4144-a553-a5bef504c4af.mage",
    "file": "size-05-20261005.png"
  },
  {
    "imageId": "2059778f-5515-4e7f-af3d-f774e9a2091e",
    "originalUrl": "https://photo-finder-media.moeionblog.workers.dev/images/products%2Fcd05b591-0882-4482-bb5b-8abd1b54c5ed.mage",
    "file": "size-01-20261005.png"
  },
  {
    "imageId": "85d1ecd6-9b22-4d9a-a210-9e1865ec98c3",
    "originalUrl": "https://photo-finder-media.moeionblog.workers.dev/images/products%2F2497329a-bdba-4b86-b974-fa795c30ddd3.mage",
    "file": "size-04-20261005.png"
  },
  {
    "imageId": "cd37fe0b-8bb8-4b56-bc1a-01af82a60414",
    "originalUrl": "https://photo-finder-media.moeionblog.workers.dev/images/products%2F93a6d450-d5f1-418f-95ac-2f2ac92f3896.mage",
    "file": "size-03-20261005.png"
  },
  {
    "imageId": "7e511dab-a15a-42b1-9430-8ad1a62bdea4",
    "originalUrl": "https://photo-finder-media.moeionblog.workers.dev/images/products%2Fc4ffa8e9-86fd-4999-bd77-edc96fdc4102.mage",
    "file": "size-01-20261005.png"
  },
  {
    "imageId": "24bf6d51-934c-410b-a80f-db4be16c5d2b",
    "originalUrl": "https://photo-finder-media.moeionblog.workers.dev/images/products%2F7bf93a39-4293-4d97-92c3-c031b04e821b.mage",
    "file": "size-05-20261005.png"
  },
  {
    "imageId": "974887f9-4780-410e-aaf5-7df7528546a7",
    "originalUrl": "https://photo-finder-media.moeionblog.workers.dev/images/products%2Fb58a5204-dd77-4029-9ab1-0877636b07b5.mage",
    "file": "size-02-20261005.png"
  }
];
  const byId = new Map(revisions.map(r => [r.imageId, r]));
  const byUrl = new Map(revisions.map(r => [r.originalUrl, r]));
  const assetUrl = r => new URL(r.file, document.baseURI).href;
  window.galleryImageRevisions = Object.freeze({
    url(image) {
      const revision = byId.get(image.id);
      return revision && revision.originalUrl === image.dataUrl ? assetUrl(revision) : image.dataUrl;
    },
    cover(url) {
      const revision = byUrl.get(url);
      return revision ? assetUrl(revision) : url;
    },
    isChart(image) {
      const revision = byId.get(image.id);
      return Boolean(revision && revision.originalUrl === image.dataUrl);
    }
  });
})();
