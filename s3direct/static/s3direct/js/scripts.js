(function(){

    "use strict"

    var getCookie = function(name) {
        var value = '; ' + document.cookie,
        parts = value.split('; ' + name + '=')
        if (parts.length == 2) return parts.pop().split(';').shift()
    }

    var request = function(method, url, data, headers, el, showProgress, async, cb, bar) {
        var req = new XMLHttpRequest()
        req.open(method, url, async)

        Object.keys(headers).forEach(function(key){
            req.setRequestHeader(key, headers[key])
        })

        req.onload = function() {
            cb(req.status, req.responseText)
        }

        req.onerror = req.onabort = function() {
            disableSubmit(false)
            error(el, 'Sorry, failed to upload file.')
        }
        if(bar != undefined)
            req.upload.onprogress = function(data) {
                progressBar(el, data, showProgress, bar)
            }

            req.send(data)
        }

        var parseURL = function(text) {
            var xml = new DOMParser().parseFromString(text, 'text/xml'),
            tag = xml.getElementsByTagName('Location')[0],
            url = unescape(tag.childNodes[0].nodeValue)

            return url
        }

        var parseJson = function(json) {
            var data
            try {data = JSON.parse(json)}
            catch(e){ data = null }
            return data
        }

        var progressBar = function(el, data, showProgress, pbar) {
            if(data.lengthComputable === false || showProgress === false) return
                var bar  = $('#' + pbar.bar)
            var pcnt = Math.round(data.loaded * 100 / data.total)
            bar.find('.bar')
            .width(pcnt + '%')

            bar.find('.pull-right')
            .text(pcnt + '%')
        }

        var error = function(el, msg) {
            el.className = 's3direct form-active'
            el.querySelector('.file-input').value = ''
            alert(msg)
        }

        var update = function(el, xml, id) {
            var link = $('#' + id),
            url  = el.querySelector('.file-url')
            url.value = parseURL(xml)
            link
            .find('a')
            .attr('href', url.value)
    }

    var concurrentUploads = 0
    var disableSubmit = function(status) {
        var submitRow = document.querySelector('.submit-row')
        if( ! submitRow) return

            var buttons = submitRow.querySelectorAll('input[type=submit]')

        if (status === true) concurrentUploads++
            else concurrentUploads--

                ;[].forEach.call(buttons, function(el){
                    el.disabled = (concurrentUploads !== 0)
                })
        }

        var upload = function(file, data, el, bar) {
            var form = new FormData()

            disableSubmit(true)

            if (data === null) return error(el, 'Sorry, could not get upload URL.')

                var url  = data['form_action']
            delete data['form_action']

            Object.keys(data).forEach(function(key){
                form.append(key, data[key])
            })
            form.append('file', file)

            request('POST', url, form, {}, el, true, true, function(status, xml){
                disableSubmit(false)
                if(status !== 201) return error(el, 'Sorry, failed to upload to S3.')
                    update(el, xml, bar.bar)
            }, bar)
        }
        var last = 0
        var getUploadURL = function(e) {
            var el       = e.target.parentElement,
            dest     = el.querySelector('.file-dest').value,
            url      = el.getAttribute('data-policy-url'),
            form     = new FormData(),
            headers  = {'X-CSRFToken': getCookie('csrftoken')}
            var files     = el.querySelector('.file-input').files
            var i=0
            for(; i<files.length; i++){
                var file = files[i],
                bar  = {
                    'bar': 'bar-' + last,
                    'file_name' : file.name
                },
                ext  = file.name.split('.').pop().toLowerCase(),
                typ
                if(!['avi', 'mp4', 'm4v', '3gp'].indexOf(ext))
                    typ = 'Video'
                else if(!['mp3', 'wav'].indexOf(ext))
                    typ = 'Audio'
                else if(!['png', 'jpg', 'jpeg'].indexOf(ext))
                    typ = 'Image'
                else if(!['doc', 'docx', 'pdf'].indexOf(ext))
                    typ = 'Docs'
                else
                    typ = ext + ' File'
                var progress_bar =
                '<div class="p-bar">' +
                '<sapn class="pull-left media-name">'+typ+'</sapn> ' +
                '<div id="' + bar.bar + '" class="bar-con">' +
                '   <a target="_blank" href="#">' +
                '       <span class="progress-label">' + bar.file_name + '</span>' +
                '   </a>' +
                '   <span class="pull-right" >0%</span>'+
                '   <div class="progress active">' +
                '       <div class="progress-bar bar"></div>' +
                '   </div>' +
                '</div>' +
                '</div>'
                $('body').append(progress_bar);
                form.append('type', file.type)
                form.append('name', file.name)
                form.append('dest', dest)
                request('POST', url, form, headers, el, false, false, function(status, json){
                    var data = parseJson(json)
                    switch(status) {
                        case 200:
                        upload(file, data, el, bar)
                        last++
                        break
                        case 400:
                        case 403:
                        error(el, data.error)
                        break;
                        default:
                        error(el, 'Sorry, could not get upload URL.')
                    }
                })
            }
        }

    // var removeUpload = function(e) {
    //     e.preventDefault()
    //
    //     var el = e.target.parentElement
    //     el.querySelector('.file-url').value = ''
    //     el.querySelector('.file-input').value = ''
    //     el.className = 's3direct form-active'
    // }

    var addHandlers = function(el) {
        var url    = el.querySelector('.file-url'),
        input  = el.querySelector('.file-input'),
        remove = el.querySelector('.file-remove'),
        status = (url.value === '') ? 'form' : 'link'

        el.className = 's3direct ' + status + '-active'

        // remove.addEventListener('click', removeUpload, false)
        input.addEventListener('change', getUploadURL, false)
    }

    document.addEventListener('DOMContentLoaded', function(e) {
        ;[].forEach.call(document.querySelectorAll('.s3direct'), addHandlers)
    })

    document.addEventListener('DOMNodeInserted', function(e){
        if(e.target.tagName) {
            var el = e.target.querySelector('.s3direct')
            if(el) addHandlers(el)
        }
})

})()