var searchFieldTagify;
var allImages;

async function loadAllImagesMetadata() {
   const response = await fetch('assets/images.json');
    const data = await response.json();
    allImages = data;
    console.log('all images loaded', allImages);
    return data;
}

function filterImagesByTags(items, selectedTags) {
  if (!selectedTags || selectedTags.length === 0) {
    return items;
  }

  return items.filter(item =>
    item.tags.some(tag => selectedTags.includes(tag.toLowerCase()))
  );
}

function loadFilteredImages(images) {
    let gallery = document.getElementById('gallery')
    let galleryHTMLs = images.map(img => `
            <div class="img-tile" data-bs-toggle="modal" data-bs-target="#previewModal"
            data-bs-imageid="${img.id}"
            >
                <img class="gallery-image"
                    src="${img.url}"
                    alt="${img.title}"
                    >
            </div>
    `);
    
    gallery.innerHTML = ''.concat(...galleryHTMLs);
}

function loadPreview(imgid) {
    const img = allImages.find( i => i.id == imgid);
    const holder = document.getElementById('preview-holder');
    const titleBar = document.getElementById('previewTitle');
    const description = document.getElementById('preview-description');
    holder.setAttribute(
        "src",
        img.url,
    );
    titleBar.innerText = img.title + " Preview";
    description.innerText = img.description;
}

function listenForPreviewEvents() {
    document.getElementById('previewModal').addEventListener(
        'show.bs.modal',
        (e) => {
            const source = e.relatedTarget;
            console.log('source node', source);
            const imgid = source.getAttribute('data-bs-imageid');
            console.log('image id got', imgid);
            loadPreview(imgid);
        }
    )
}

function attachTagifyToSearchField() {
    let searchField = document.querySelector('#search-field');
    searchFieldTagify = new Tagify(searchField);

    searchField.addEventListener('change', (e) => {
        console.log('new value', e.target.value);
        let input = JSON.parse(e.target.value || '[]');
        let tags = input.map(t => t.value.toLowerCase());
        let images = filterImagesByTags(allImages, tags);
        loadFilteredImages(images);
    })
}

document.addEventListener(
    'readystatechange',
    ($e) => {
        if (document.readyState === 'complete') {
            loadAllImagesMetadata()
                .then(images => loadFilteredImages(images));
            attachTagifyToSearchField();
            listenForPreviewEvents();
        }
    }
)