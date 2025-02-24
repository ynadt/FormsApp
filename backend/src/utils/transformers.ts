export const transformTemplate = (tmpl: any) => ({
  id: tmpl.id,
  title: tmpl.title,
  description: tmpl.description,
  image_url: tmpl.image_url,
  public: tmpl.public,
  createdAt: tmpl.createdAt.toISOString(),
  updatedAt: tmpl.updatedAt.toISOString(),
  version: tmpl.version,
  authorId: tmpl.user?.id || '',
  authorEmail: tmpl.user?.email || '',
  authorName: tmpl.user?.name || '',
  topic: tmpl.topic ? { id: tmpl.topic.id, name: tmpl.topic.name } : null,
  tags: tmpl.tags?.map((tt: any) => ({ id: tt.id, name: tt.tag.name })) || [],
});

export const transformForm = (frm: any) => ({
  id: frm.id,
  authorId: frm.user?.id || '',
  authorEmail: frm.user?.email || '',
  authorName: frm.user?.name || '',
  createdAt: frm.createdAt.toISOString(),
  updatedAt: frm.updatedAt.toISOString(),
  version: frm.version,
  answers: frm.answers,
  template: frm.template
    ? {
        id: frm.template.id,
        title: frm.template.title,
        description: frm.template.description,
        image_url: frm.template.image_url,
        public: frm.template.public,
        createdAt: frm.template.createdAt.toISOString(),
        updatedAt: frm.template.updatedAt.toISOString(),
        version: frm.template.version,
        authorId: frm.template.user?.id || '',
        authorEmail: frm.template.user?.email || '',
        authorName: frm.template.user?.name || '',
        questions: frm.template.questions || [],
        topic: frm.template.topic
          ? { id: frm.template.topic.id, name: frm.template.topic.name }
          : null,
        tags:
          frm.template.tags?.map((tt: any) => ({
            id: tt.id,
            name: tt.tag.name,
          })) || [],
      }
    : null,
});
