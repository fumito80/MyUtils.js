PS1='\[\033]0;\W\007\]' # set window title
# PS1='\[\033]0;$TITLEPREFIX:$PWD\007\]' # set window title
PS1="$PS1"'\n'                 # new line
# PS1="$PS1"'\[\033[32m\]'       # change to green
# PS1="$PS1"'\u@\h '             # user@host<space>
# PS1="$PS1"'\[\033[35m\]'       # change to purple
# PS1="$PS1"'$MSYSTEM '          # show MSYSTEM
# PS1="$PS1"'\[\033[33m\]'       # change to brownish yellow
PS1="$PS1"'\w'                 # current working directory
if test -z "$WINELOADERNOEXEC"
then
        GIT_EXEC_PATH="$(git --exec-path 2>/dev/null)"
        COMPLETION_PATH="${GIT_EXEC_PATH%/libexec/git-core}"
        COMPLETION_PATH="${COMPLETION_PATH%/lib/git-core}"
        COMPLETION_PATH="$COMPLETION_PATH/share/git/completion"
        if test -f "$COMPLETION_PATH/git-prompt.sh"
        then
                GIT_PS1_SHOWDIRTYSTATE=true
                GIT_PS1_SHOWUNTRACKEDFILES=true
                GIT_PS1_SHOWSTASHSTATE=true
                GIT_PS1_SHOWUPSTREAM="auto"
                GIT_PS1_SHOWCOLORHINTS=true
                . "$COMPLETION_PATH/git-completion.bash"
                . "$COMPLETION_PATH/git-prompt.sh"
#                PS1="$PS1"'\[\033[36m\]'  # change color to cyan
                PS1="$PS1"'`__git_ps1`'   # bash function
#                PS1="$PS1"`git branch 2> /dev/null | sed -e '/^[^*]/d' -e 's/* \(.*\)/ [\1]/'`
        fi
fi
# PS1="$PS1"'\[\033[0m\]'        # change color
# PS1="$PS1"'\n'                 # new line
PS1="$PS1"'> '                 # prompt: always $
