import os

from django.forms import widgets
from django.utils.safestring import mark_safe
from django.core.urlresolvers import reverse
from django.conf import settings


class S3DirectWidget(widgets.TextInput):

    default_html = (
        '<div class="s3direct" data-policy-url="{policy_url}">'
        '  <input class="file-url" type="hidden" value="{file_url}" id="{element_id}" name="{name}" />'
        '  <input class="file-dest" type="hidden" value="{dest}">'
        '  <input class="file-input" type="file" multiple/>'
        '  </div>'
        '</div>'
    )

    class Media:
        js = (
            's3direct/js/scripts.js',
            's3direct/js/jquery-2.1.1.min.js',
        )
        css = {
            'all': (
                's3direct/css/bootstrap-progress.min.css',
                's3direct/css/styles.css',
            )
        }

    def __init__(self, *args, **kwargs):
        self.dest = kwargs.pop('dest', None)
        self.html = kwargs.pop('html', self.default_html)
        super(S3DirectWidget, self).__init__(*args, **kwargs)

    def render(self, name, value, attrs=None):
        output = self.html.format(
            policy_url=reverse('s3direct'),
            element_id=self.build_attrs(attrs).get('id'),
            file_name=os.path.basename(value or ''),
            dest=self.dest,
            file_url=value or '',
            name=name)

        return mark_safe(output)
