import {test} from 'node:test';
import assert from 'node:assert/strict';
import {blogSchema,isPublic,type Post} from '../src/lib/blog';
import {renderMarkdown} from '../src/lib/markdown';
const post:Post={id:'11111111-1111-4111-8111-111111111111',title:'Le lavage de gobelets',slug:'lavage-gobelets',excerpt:'Un guide pour les organisateurs.',content_markdown:'## Les étapes\n\nUn contenu suffisamment long pour la validation du guide.',seo_title:'',seo_description:'',category:'Guides',cover_url:'',cover_alt:'',author_name:'Équipe LPSA',status:'scheduled',published_at:'2026-12-01T10:00:00.000Z',created_at:'',updated_at:''};
test('scheduled posts become public at exactly their date; drafts never do',()=>{
  assert.equal(isPublic(post,new Date('2026-12-01T09:59:59Z').getTime()),false);
  assert.equal(isPublic(post,new Date('2026-12-01T10:00:00Z').getTime()),true);
  assert.equal(isPublic({...post,status:'draft'},new Date('2027-01-01').getTime()),false);
  const {created_at:_created,updated_at:_updated,...input}=post;
  assert.equal(blogSchema.safeParse({...input,published_at:null,expected_updated_at:null}).success,false);
});
test('Markdown HTML preview and public renderer remove scripts and executable links',()=>{
  const html=renderMarkdown('## Un guide\n\n<script>alert(1)</script>\n\n<a href="javascript:alert(1)" onclick="alert(1)">lien</a><img src="x" onerror="alert(1)">\n\n[Source](https://example.com)');
  assert.match(html,/<h2>Un guide<\/h2>/);assert.doesNotMatch(html,/script|javascript:|onclick|onerror|<img/);assert.match(html,/href="https:\/\/example.com"/);
});
