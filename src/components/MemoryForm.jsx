import React, { useState } from 'react';
import { ArrowUpRight, ImageUp } from 'lucide-react';
import { supabase, supabaseConfigured } from '../lib/supabase';

const BUCKET = 'memory-uploads';
const MAX_FILE_SIZE = 25 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  'image/jpeg', 'image/png', 'image/webp',
  'video/mp4', 'video/webm', 'video/quicktime',
]);

function displayDate(date) {
  return new Date(`${date}T12:00:00`).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

export default function MemoryForm({ categories, onAdded }) {
  const [caption, setCaption] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState(categories[0] || 'university life');
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [website, setWebsite] = useState('');

  if (!supabaseConfigured) {
    return <aside className="memory-config-note" role="status">
      <b>Memory uploads are being set up.</b>
      <span>Add the Supabase URL and publishable key, then run <code>supabase/setup.sql</code>. The form will turn on automatically.</span>
    </aside>;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setError('');
    setSuccess('');
    if (website) return; // Quietly discard honeypot submissions.
    if (!file) return setError('Choose a photo or video first.');
    if (!ALLOWED_TYPES.has(file.type)) return setError('Use a JPG, PNG, WebP, MP4, WebM, or MOV file.');
    if (file.size > MAX_FILE_SIZE) return setError('The file is too large. The maximum is 25 MB.');
    if (!caption.trim()) return setError('Add a short caption before saving.');

    setBusy(true);
    let uploadedPath;
    try {
      const extension = file.name.split('.').pop()?.toLowerCase() || 'bin';
      const uniquePart = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      uploadedPath = `${new Date().getUTCFullYear()}/${uniquePart}.${extension}`;
      const { error: uploadError } = await supabase.storage.from(BUCKET).upload(uploadedPath, file, {
        cacheControl: '3600', contentType: file.type, upsert: false,
      });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(uploadedPath);
      const mediaType = file.type.startsWith('video/') ? 'video' : 'photo';
      const { data, error: insertError } = await supabase.from('memories').insert({
        caption: caption.trim(),
        memory_date: date || null,
        category,
        media_path: uploadedPath,
        media_type: mediaType,
      }).select().single();
      if (insertError) throw insertError;

      onAdded({
        id: data.id,
        category: data.category,
        title: data.memory_date ? displayDate(data.memory_date) : 'A new memory',
        note: data.caption,
        date: data.memory_date ? displayDate(data.memory_date) : undefined,
        media: data.media_type,
        ...(data.media_type === 'video' ? { videoSrc: urlData.publicUrl } : { image: urlData.publicUrl }),
        label: data.media_type === 'video' ? 'OUR VIDEO' : 'OUR PHOTO',
      });
      setCaption('');
      setDate('');
      setFile(null);
      formElement.reset();
      setSuccess('Your memory is in the archive.');
    } catch (uploadError) {
      console.error('Memory upload failed:', uploadError);
      setError(uploadError.message || 'The upload did not finish. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return <form className="memory-form" onSubmit={handleSubmit}>
    <p className="eyebrow">ADD TO OUR SHARED ARCHIVE</p>
    <label className="memory-field">Caption
      <textarea value={caption} onChange={event => setCaption(event.target.value)} maxLength={500} rows={3} required placeholder="What do you want us to remember?" />
    </label>
    <div className="memory-form-row">
      <label className="memory-field">Date <span>(optional)</span>
        <input type="date" value={date} onChange={event => setDate(event.target.value)} />
      </label>
      <label className="memory-field">Category
        <select value={category} onChange={event => setCategory(event.target.value)}>
          {categories.map(item => <option value={item} key={item}>{item}</option>)}
        </select>
      </label>
    </div>
    <label className="memory-file-field"><ImageUp size={20}/><span>{file ? file.name : 'Choose a photo or video (max 25 MB)'}</span>
      <input type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime" onChange={event => { setFile(event.target.files?.[0] || null); setError(''); }} required />
    </label>
    <label className="memory-honeypot" aria-hidden="true">Leave this field empty<input tabIndex={-1} autoComplete="off" value={website} onChange={event => setWebsite(event.target.value)} /></label>
    <p className="memory-privacy">Submitted photos and videos can be seen by anyone with the website link.</p>
    {error && <p className="memory-feedback error" role="alert">{error}</p>}
    {success && <p className="memory-feedback success" role="status">{success}</p>}
    <button className="add-button memory-submit" type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save to the archive'} {!busy && <ArrowUpRight size={17}/>}</button>
  </form>;
}
